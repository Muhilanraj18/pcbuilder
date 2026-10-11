/**
 * scripts/testCatalog.ts
 *
 * Throwaway smoke-test — confirms real rows come back from the DB
 * before wiring build.ts in the next prompt.
 *
 * Usage:
 *   npx tsx scripts/testCatalog.ts
 */
import path from 'path';
import fs from 'fs';

function loadEnvFile(f: string) {
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const l = line.trim();
    if (!l || l.startsWith('#') || !l.includes('=')) continue;
    const [k, ...rest] = l.split('=');
    const v = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (k && v && !process.env[k]) process.env[k] = v;
  }
}
loadEnvFile(path.join(__dirname, '..', '.env'));
loadEnvFile(path.join(__dirname, '..', '.env.local'));

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 Testing: getEligibleProducts("Processor", 15000)\n');

  const products = await prisma.product.findMany({
    where: {
      category: 'Processor',
      currentPrice: { lte: 15000 },
      isVerified: true,
      inStock: true,
    },
    orderBy: { currentPrice: 'desc' },
  });

  if (products.length === 0) {
    console.log('❌ No results — check that the migration ran successfully.');
    return;
  }

  console.log(`✅ Found ${products.length} processor(s) under ₹15,000:\n`);
  for (const p of products) {
    console.log(`  ₹${p.currentPrice.toLocaleString('en-IN')}  ${p.name}  [tier: ${p.tier ?? 'none'}]`);
  }
  console.log('');
}

main()
  .catch(e => { console.error('Test failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
