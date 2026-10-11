/**
 * GET /api/products
 *
 * Public-read endpoint for the product catalog. Used by the admin panel
 * and for debugging during development.
 *
 * Query params:
 *   category     string  — filter by category ("Processor", "Graphics Card", …)
 *   maxBudget    number  — max currentPrice (inclusive)
 *   tier         string  — filter by tier ("budget", "midRange", …)
 *   verifiedOnly boolean — default true; pass "false" to include unverified rows
 *                          (admin "needs attention" queue only)
 *
 * Response: { count: number, products: Product[] }
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      category,
      maxBudget,
      tier,
      verifiedOnly = 'true',
    } = req.query as Record<string, string>;

    // Build the where clause dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (category) {
      where.category = category;
    }

    if (tier) {
      where.tier = tier;
    }

    if (maxBudget) {
      const budget = parseInt(maxBudget, 10);
      if (!isNaN(budget)) {
        where.currentPrice = { lte: budget };
      }
    }

    // verifiedOnly defaults to true — only expose verified products by default.
    // Pass verifiedOnly=false explicitly to see the admin queue.
    if (verifiedOnly !== 'false') {
      where.isVerified = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { currentPrice: 'desc' },
      select: {
        id:              true,
        name:            true,
        category:        true,
        tier:            true,
        brand:           true,
        currentPrice:    true,
        imageUrl:        true,
        amazonUrl:       true,
        flipkartUrl:     true,
        mdcomputersUrl:  true,
        isVerified:      true,
        inStock:         true,
        refreshTier:     true,
        lastPriceCheckAt:true,
        updatedAt:       true,
      },
    });

    return res.status(200).json({ count: products.length, products });
  } catch (err) {
    console.error('[/api/products] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch products. Please try again.' });
  }
}
