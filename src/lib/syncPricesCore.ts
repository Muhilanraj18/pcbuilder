/**
 * src/lib/syncPricesCore.ts
 *
 * Shared price-sync logic used by both:
 *   - scripts/syncPrices.ts  (CLI batch job, npm run update-prices)
 *   - src/pages/api/cron/sync-prices.ts  (protected cron API route)
 *
 * Quota math (documented per spec):
 *   Default limit = 80 lookups/run.
 *   If run weekly: 80 × ~4 runs/month = ~320 requests/month.
 *   ⚠️  SerpAPI free tier = 100 req/month. So with free tier, set limit=3
 *   for weekly runs (3 × 4 = 12/month) or limit=24 for monthly single run.
 *   Adjust SYNC_LIMIT env var or --limit CLI flag accordingly.
 */

import path from 'path';
import fs from 'fs';
import { prisma } from './prisma';
import { lookupPrice } from './priceLookup';

export interface SyncOptions {
  limit:        number;   // max lookups this run
  priorityOnly: boolean;  // if true: only check "volatile" products (GPU + CPU)
}

export interface SyncSummary {
  totalChecked:    number;
  updated:         number;
  skippedLowConf:  number;
  failed:          number;
  serpApiRequests: number;
  durationMs:      number;
}

// ── Run counter (Priority 2 throttle) ────────────────────────────────────────

const COUNTER_FILE = path.join(process.cwd(), 'sync-run-counter.json');
const PRIORITY2_EVERY_N_RUNS = 3;

function readRunCounter(): number {
  try {
    if (!fs.existsSync(COUNTER_FILE)) return 0;
    const raw = fs.readFileSync(COUNTER_FILE, 'utf8');
    return (JSON.parse(raw) as { count: number }).count ?? 0;
  } catch { return 0; }
}

function writeRunCounter(count: number): void {
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count, updatedAt: new Date().toISOString() }), 'utf8');
}

// ── Manual review queue ───────────────────────────────────────────────────────

const REVIEW_FILE = path.join(process.cwd(), 'needs-manual-review.json');

interface ReviewEntry {
  productName:  string;
  category:     string;
  currentPrice: number;
  foundTitle:   string;
  foundPrice:   number;
  checkedAt:    string;
}

function appendToReviewQueue(entry: ReviewEntry): void {
  let existing: Record<string, ReviewEntry> = {};
  try {
    if (fs.existsSync(REVIEW_FILE)) {
      existing = JSON.parse(fs.readFileSync(REVIEW_FILE, 'utf8')) as Record<string, ReviewEntry>;
    }
  } catch { /* start fresh if corrupt */ }

  existing[entry.productName] = entry;
  fs.writeFileSync(REVIEW_FILE, JSON.stringify(existing, null, 2), 'utf8');
}

// ── Delay helper ──────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Core sync function ────────────────────────────────────────────────────────

export async function runPriceSync(opts: SyncOptions): Promise<SyncSummary> {
  const startTime = Date.now();

  const runCount  = readRunCounter() + 1;
  const checkP2   = !opts.priorityOnly && (runCount % PRIORITY2_EVERY_N_RUNS === 0);

  writeRunCounter(runCount);

  // ── Select products to check ──────────────────────────────────────────────
  //   Priority 1 (volatile): Processor + Graphics Card — every run
  //   Priority 2 (standard): everything else — every 3rd run only
  const volatileWhere  = { refreshTier: 'volatile' };
  const standardWhere  = { refreshTier: 'standard' };

  const priority1 = await prisma.product.findMany({
    where: volatileWhere,
    orderBy: { lastPriceCheckAt: 'asc' },   // oldest-checked first
    take: opts.limit,
    select: { id: true, name: true, category: true, currentPrice: true },
  });

  let products = [...priority1];

  if (checkP2 && products.length < opts.limit) {
    const p2 = await prisma.product.findMany({
      where: standardWhere,
      orderBy: { lastPriceCheckAt: 'asc' },
      take: opts.limit - products.length,
      select: { id: true, name: true, category: true, currentPrice: true },
    });
    products = [...products, ...p2];
  }

  // Respect hard limit
  products = products.slice(0, opts.limit);

  // ── Process each product ──────────────────────────────────────────────────
  let updated         = 0;
  let skippedLowConf  = 0;
  let failed          = 0;
  let serpApiRequests = 0;

  for (const product of products) {
    try {
      const result = await lookupPrice(product.name, product.category);

      if (result === null) {
        // Nothing found — log as failure so we can track coverage
        failed++;
        console.log(`  ❌  ${product.name} — no result found`);
      } else if (result.source === 'serpapi') {
        serpApiRequests++;

        if (result.matchConfidence === 'high') {
          // Update the DB
          await prisma.product.update({
            where: { id: product.id },
            data: {
              lastPriceValue:   product.currentPrice,
              currentPrice:     result.price,
              inStock:          result.inStock,
              lastPriceCheckAt: new Date(),
            },
          });
          // Append to price history
          await prisma.priceHistory.create({
            data: {
              productId: product.id,
              price:     result.price,
              source:    result.source,
            },
          });

          const delta = result.price - product.currentPrice;
          const deltaStr = delta === 0 ? 'unchanged' : `${delta > 0 ? '+' : ''}₹${delta.toLocaleString('en-IN')}`;
          console.log(`  ✅  ${product.name} — ₹${result.price.toLocaleString('en-IN')} (${deltaStr})`);
          updated++;
        } else {
          // Low-confidence match — do NOT update the DB, queue for human review
          appendToReviewQueue({
            productName:  product.name,
            category:     product.category,
            currentPrice: product.currentPrice,
            foundTitle:   result.matchedTitle,
            foundPrice:   result.price,
            checkedAt:    new Date().toISOString(),
          });
          console.log(`  ⚠️   ${product.name} — LOW CONFIDENCE → needs-manual-review.json`);
          skippedLowConf++;
        }
      } else {
        // PA-API result (high confidence by definition)
        await prisma.product.update({
          where: { id: product.id },
          data: {
            lastPriceValue:   product.currentPrice,
            currentPrice:     result.price,
            inStock:          result.inStock,
            lastPriceCheckAt: new Date(),
          },
        });
        console.log(`  ✅  ${product.name} — ₹${result.price.toLocaleString('en-IN')} [PA-API]`);
        updated++;
      }
    } catch (err) {
      console.error(`  💥  ${product.name} — Error: ${(err as Error).message}`);
      failed++;
    }

    // 2-second delay between requests to respect rate limits
    await sleep(2000);
  }

  const durationMs = Date.now() - startTime;

  return {
    totalChecked: products.length,
    updated,
    skippedLowConf,
    failed,
    serpApiRequests,
    durationMs,
  };
}

export function printSyncSummary(summary: SyncSummary, priorityOnly: boolean): void {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊  PRICE SYNC COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Mode             : ${priorityOnly ? 'Priority-1 only (volatile)' : 'Full run'}`);
  console.log(`   Total checked    : ${summary.totalChecked}`);
  console.log(`   Updated          : ${summary.updated}`);
  console.log(`   Skipped (low-conf): ${summary.skippedLowConf}  → see needs-manual-review.json`);
  console.log(`   Failed           : ${summary.failed}`);
  console.log(`   SerpAPI requests : ${summary.serpApiRequests}  (free tier: 100/month)`);
  console.log(`   Duration         : ${(summary.durationMs / 1000).toFixed(1)}s`);
  console.log('═══════════════════════════════════════════════════════\n');
}
