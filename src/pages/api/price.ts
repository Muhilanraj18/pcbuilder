// /api/price
//
// Returns the last-verified price from the component database.
// Live SerpAPI calls have been moved to the background sync job (/api/cron/sync-prices).
// This endpoint no longer makes any outbound API calls per page view.

import type { NextApiRequest, NextApiResponse } from 'next';
import { cleanProductName } from '@/utils/productNameCleaner';
import { componentPrices } from '@/utils/marketPrices';
import { getPriceUpdateInfo } from '@/utils/marketPrices';

interface PriceResponse {
  price?: number | null;
  product?: string;
  source?: string;
  lastVerified?: string;
  error?: string;
}

function extractNumericPrice(priceStr: string | number | undefined): number | null {
  if (priceStr === undefined || priceStr === null) return null;
  const str = String(priceStr).replace(/Rs\./gi, '').replace(/[₹$,\s]/g, '').trim();
  const num = parseFloat(str);
  return !isNaN(num) && num > 0 && num < 10_000_000 ? num : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed', price: null });
  }

  const { product } = req.query;

  if (!product || typeof product !== 'string') {
    return res.status(400).json({ error: 'Product name required', price: null });
  }

  const cleanedName = cleanProductName(product);
  if (!cleanedName) {
    return res.status(400).json({ error: 'Invalid product name', price: null });
  }

  const priceInfo = getPriceUpdateInfo();

  // Search the local database for a matching price
  for (const [, items] of Object.entries(componentPrices)) {
    if (typeof items !== 'object' || items === null) continue;

    for (const [, tierItems] of Object.entries(items)) {
      if (typeof tierItems !== 'object' || tierItems === null) continue;

      for (const [itemName, price] of Object.entries(tierItems)) {
        const cleanedItemName = cleanProductName(itemName);
        if (
          cleanedItemName.includes(cleanedName) ||
          cleanedName.includes(cleanedItemName) ||
          itemName.toLowerCase().includes(product.toLowerCase())
        ) {
          const foundPrice = extractNumericPrice(price as string | number);
          if (foundPrice) {
            return res.status(200).json({
              price: foundPrice,
              product: cleanedName,
              source: 'Market Database',
              lastVerified: priceInfo.lastUpdate,
            });
          }
        }
      }
    }

    // Flat category (e.g. powerSupplies, cabinets)
    for (const [itemName, price] of Object.entries(items)) {
      const cleanedItemName = cleanProductName(itemName);
      if (
        cleanedItemName.includes(cleanedName) ||
        cleanedName.includes(cleanedItemName) ||
        itemName.toLowerCase().includes(product.toLowerCase())
      ) {
        const foundPrice = extractNumericPrice(price as string | number);
        if (foundPrice) {
          return res.status(200).json({
            price: foundPrice,
            product: cleanedName,
            source: 'Market Database',
            lastVerified: priceInfo.lastUpdate,
          });
        }
      }
    }
  }

  return res.status(404).json({ error: 'Product not found in database', price: null });
}
