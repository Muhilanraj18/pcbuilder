/**
 * scripts/syncPrices.ts
 *
 * CLI batch job for updating product prices from SerpAPI / Amazon PA-API.
 * Replaces the old scripts/updatePrices.js (which only touched a timestamp).
 *
 * Usage:
 *   npm run update-prices                   # full run (P1 + P2 if 3rd run)
 *   npm run update-prices:priority          # P1 only (GPU + CPU)
 *   tsx scripts/syncPrices.ts --limit=10    # cap at 10 lookups (testing)
 *
 * MANUAL FALLBACK:
 *   For products the automated job can't confidently match (low-confidence
 *   results land in needs-manual-review.json), open marketPrices.ts and
 *   update the price directly, then re-run: npm run migrate-db
 *   That re-upserts with the corrected value.
 *
 * Quota reminder:
 *   Default --limit=80. SerpAPI free tier = 100 req/month.
 *   Running weekly: 80 × 4 = 320/month — EXCEEDS free tier.
 *   For free tier: use --limit=3 weekly OR --limit=24 monthly.
 *   Set the limit to match your actual SerpAPI plan.
 */

import path from 'path';
import fs from 'fs';

// Manual env loading (same pattern used across all scripts in this project)
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (key && value && !process.env[key]) process.env[key] = value;
  }
}
loadEnvFile(path.join(__dirname, '..', '.env'));
loadEnvFile(path.join(__dirname, '..', '.env.local'));

import { runPriceSync, printSyncSummary } from '../src/lib/syncPricesCore';

// ── Parse CLI args ────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 80;

const args = process.argv.slice(2);
const limitArg   = args.find(a => a.startsWith('--limit='));
const limit      = limitArg ? parseInt(limitArg.split('=')[1], 10) : DEFAULT_LIMIT;
const priorityOnly = args.includes('--priority-only');

async function main() {
  console.log(`\n🔄  PC Builder India — Price Sync`);
  console.log(`   Mode    : ${priorityOnly ? 'Priority-1 only' : 'Full run'}`);
  console.log(`   Limit   : ${limit} lookups\n`);

  if (!process.env.SERP_API_KEY) {
    console.warn('⚠️  SERP_API_KEY is not set in .env.local — SerpAPI lookups will be skipped.');
    console.warn('   Set the key to enable live price fetching.\n');
  }

  const summary = await runPriceSync({ limit, priorityOnly });
  printSyncSummary(summary, priorityOnly);
}

main()
  .catch(e => { console.error('Sync failed:', e); process.exit(1); })
  .finally(async () => {
    // Disconnect Prisma gracefully
    const { prisma } = await import('../src/lib/prisma');
    await prisma.$disconnect();
  });
