/**
 * src/pages/api/cron/sync-prices.ts
 *
 * Protected API route that runs the same price-sync logic as scripts/syncPrices.ts.
 * Designed to be triggered by Vercel Cron (see vercel.json) or any HTTP scheduler.
 *
 * Security:
 *   Vercel Cron automatically injects an `Authorization: Bearer <CRON_SECRET>`
 *   header on every invocation, so the handler checks that first.
 *   For local testing (where `vercel dev` / `next dev` don't simulate real cron
 *   triggers) a `?secret=<value>` query-param fallback is also accepted.
 *   Returns 401 if neither matches. Returns 500 if CRON_SECRET is not set at all.
 *   This MUST never be callable by a random visitor.
 *
 * Limit note:
 *   Default limit is 80. If on SerpAPI free tier (100 req/month) and running
 *   daily via Vercel Cron, change SYNC_LIMIT env var to 3 (3 × 30 = 90/month).
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { runPriceSync } from '@/lib/syncPricesCore';
import { prisma } from '@/lib/prisma';

const DEFAULT_LIMIT = parseInt(process.env.SYNC_LIMIT ?? '80', 10);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // CRON_SECRET not configured — refuse all requests for safety
    return res.status(500).json({ error: 'CRON_SECRET is not configured on this server.' });
  }

  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers['authorization'];
  const expected   = `Bearer ${secret}`;

  // Fallback: ?secret=<value> for local curl testing (next dev / vercel dev
  // do not inject the Authorization header automatically).
  const querySecret = req.query['secret'];

  const authorizedViaHeader = authHeader === expected;
  const authorizedViaQuery  = typeof querySecret === 'string' && querySecret === secret;

  if (!authorizedViaHeader && !authorizedViaQuery) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── Only allow POST or GET (Vercel Cron sends GET) ──────────────────────────
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const summary = await runPriceSync({
      limit:        DEFAULT_LIMIT,
      priorityOnly: false,
    });

    return res.status(200).json({
      ok:           true,
      totalChecked: summary.totalChecked,
      updated:      summary.updated,
      skipped:      summary.skippedLowConf,
      failed:       summary.failed,
      serpApiReqs:  summary.serpApiRequests,
      durationMs:   summary.durationMs,
    });
  } catch (err) {
    console.error('[/api/cron/sync-prices] Error:', err);
    return res.status(500).json({ error: 'Sync failed. Check server logs.' });
  } finally {
    await prisma.$disconnect();
  }
}
