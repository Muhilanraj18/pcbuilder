/**
 * scripts/migrateToDb.ts
 *
 * One-time migration: reads static marketPrices.ts + productLinks.ts and
 * upserts every product into the Postgres `Product` table.
 *
 * Safe to re-run — uses upsert on the unique `name` field, so duplicate rows
 * are never created.
 *
 * Usage:
 *   npx tsx scripts/migrateToDb.ts
 */
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Load .env and .env.local so DATABASE_URL is available when running via tsx
// (tsx doesn't use Prisma CLI's env loading)
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

// Import static data
import { componentPrices } from '../src/utils/marketPrices';
import { productDatabase } from '../src/utils/productLinks';

const prisma = new PrismaClient();

// ── Category name mapping ─────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  processors:     'Processor',
  graphicsCards:  'Graphics Card',
  motherboards:   'Motherboard',
  ram:            'RAM',
  storage:        'Storage',
  powerSupplies:  'Power Supply',
  cabinets:       'Cabinet',
  keyboards:      'Keyboard',
  mice:           'Mouse',
  cooling:        'Cooling',
  monitors:       'Monitor',
};

// Volatile categories are checked every sync run; others every 3rd run
const VOLATILE_CATEGORIES = new Set(['Processor', 'Graphics Card']);

// ── Helpers ───────────────────────────────────────────────────────────────────
function firstWord(name: string): string {
  return name.split(' ')[0] || 'Generic';
}

interface UpsertResult {
  name: string;
  category: string;
  isVerified: boolean;
  refreshTier: string;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting migration from static files → Postgres...\n');

  const results: UpsertResult[] = [];
  const errors: string[] = [];

  // Iterate every top-level category in componentPrices
  for (const [rawCat, catValue] of Object.entries(componentPrices)) {
    const category = CATEGORY_MAP[rawCat] ?? rawCat;

    if (typeof catValue !== 'object' || catValue === null) continue;

    // Determine if this category is tiered (has nested objects) or flat
    const firstVal = Object.values(catValue)[0];
    const isTiered = typeof firstVal === 'object' && firstVal !== null;

    if (isTiered) {
      // e.g. processors.budget.{ "Intel Core i3-12100F": 7499 }
      for (const [tier, tierProducts] of Object.entries(catValue as Record<string, Record<string, number>>)) {
        for (const [name, price] of Object.entries(tierProducts)) {
          try {
            const result = await upsertProduct({ name, category, tier, price });
            results.push(result);
          } catch (e) {
            errors.push(`${name}: ${(e as Error).message}`);
          }
        }
      }
    } else {
      // e.g. cabinets.{ "Corsair 4000D Airflow": 8499 }
      for (const [name, price] of Object.entries(catValue as Record<string, number>)) {
        try {
          const result = await upsertProduct({ name, category, tier: null, price });
          results.push(result);
        } catch (e) {
          errors.push(`${name}: ${(e as Error).message}`);
        }
      }
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const verified   = results.filter(r => r.isVerified).length;
  const unverified = results.filter(r => !r.isVerified).length;
  const volatile   = results.filter(r => r.refreshTier === 'volatile').length;
  const standard   = results.filter(r => r.refreshTier === 'standard').length;

  // Per-category breakdown
  const byCat: Record<string, number> = {};
  for (const r of results) {
    byCat[r.category] = (byCat[r.category] ?? 0) + 1;
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅  MIGRATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Total products migrated : ${results.length}`);
  console.log(`   isVerified = true       : ${verified}`);
  console.log(`   isVerified = false      : ${unverified}`);
  console.log(`   refreshTier = volatile  : ${volatile}  (GPU + CPU)`);
  console.log(`   refreshTier = standard  : ${standard}`);
  console.log('');
  console.log('   Breakdown by category:');
  for (const [cat, count] of Object.entries(byCat).sort()) {
    console.log(`     ${cat.padEnd(16)}: ${count}`);
  }
  if (errors.length > 0) {
    console.log('');
    console.log(`   ⚠️  Errors (${errors.length}):`);
    for (const e of errors) console.log(`     - ${e}`);
  }
  console.log('═══════════════════════════════════════════════════════');
}

// ── Upsert a single product ───────────────────────────────────────────────────
async function upsertProduct({
  name, category, tier, price,
}: {
  name: string;
  category: string;
  tier: string | null;
  price: number;
}): Promise<UpsertResult> {
  const existing = productDatabase[name];
  const isVerified = !!existing;
  const refreshTier = VOLATILE_CATEGORIES.has(category) ? 'volatile' : 'standard';

  const data = {
    category,
    tier: tier ?? null,
    brand:         isVerified ? existing.brand : firstWord(name),
    currentPrice:  price,
    imageUrl:      isVerified ? (existing.imageUrl ?? '') : '',
    amazonUrl:     isVerified ? (existing.buyLinks?.amazon  ?? null) : null,
    flipkartUrl:   isVerified ? (existing.buyLinks?.flipkart ?? null) : null,
    mdcomputersUrl:isVerified ? (existing.buyLinks?.mdcomputers ?? null) : null,
    isVerified,
    refreshTier,
    lastPriceCheckAt: new Date(),
  };

  await prisma.product.upsert({
    where:  { name },
    create: { name, ...data },
    update: data,
  });

  return { name, category, isVerified, refreshTier };
}

main()
  .catch(e => { console.error('Migration failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
