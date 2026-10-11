/**
 * src/lib/catalog.ts
 *
 * The ONLY authorized way to query products in this app.
 * All recommendation logic must call getEligibleProducts() — never query
 * prisma.product directly elsewhere.
 */
import { prisma } from './prisma';

export { prisma };

/**
 * Returns products that are in stock, within budget, and optionally in a
 * specific tier. Ordered by price descending (best spec within budget first).
 *
 * @param requireVerified  If true, only returns isVerified=true rows.
 *                         Defaults to false — the build API should use the
 *                         full catalog; verification is an admin quality flag,
 *                         not a user-facing filter.
 */
export async function getEligibleProducts(
  category: string,
  maxBudget: number,
  tier?: string,
  requireVerified = false,
) {
  return prisma.product.findMany({
    where: {
      category,
      ...(tier ? { tier } : {}),
      currentPrice: { lte: maxBudget },
      ...(requireVerified ? { isVerified: true } : {}),
      inStock: true,
    },
    orderBy: { currentPrice: 'desc' },
  });
}

/**
 * Returns a single product by exact name. Returns null if not found.
 * Useful for individual product detail lookups.
 */
export async function getProductByName(name: string) {
  return prisma.product.findUnique({ where: { name } });
}

/**
 * Returns all products in a category, regardless of budget or verification.
 * Intended for admin/review tooling only — do not expose this to end users.
 */
export async function getAllInCategory(category: string) {
  return prisma.product.findMany({
    where: { category },
    orderBy: { currentPrice: 'asc' },
  });
}
