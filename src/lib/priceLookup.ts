/**
 * src/lib/priceLookup.ts
 *
 * Single function to look up the current Indian market price for one product.
 *
 * Strategy:
 *   1. Amazon PA-API (if AWS_PRODUCT_ADVERTISING_KEY is set)  → source: 'pa-api'
 *   2. SerpAPI Google Shopping (fallback)                      → source: 'serpapi'
 *
 * matchConfidence:
 *   'high' — the result title contains the key model-number tokens from the
 *            product name (e.g. "4060", "5600G", "NH-D15"). Use this price.
 *   'low'  — fuzzy/best-guess match. Do NOT auto-update the DB; log for review.
 */
import { searchGoogleShopping, parsePrice } from './serpApiClient';

export interface PriceLookupResult {
  price:           number;
  inStock:         boolean;
  source:          'pa-api' | 'serpapi';
  matchConfidence: 'high' | 'low';
  matchedTitle:    string;
}

// ── Match confidence ──────────────────────────────────────────────────────────

/**
 * Extracts tokens from a product name that are strong discriminators:
 * model numbers (alphanumeric with digits), capacity strings, and
 * well-known brand abbreviations. Pure English words under 4 chars are skipped.
 *
 * Examples:
 *   "AMD Ryzen 5 5600G"   → ["5600G"]
 *   "ZOTAC RTX 4060 8GB"  → ["4060", "8GB"]
 *   "NH-D15"              → ["NH-D15"]
 */
function keyTokens(name: string): string[] {
  return name
    .split(/[\s,]+/)
    .filter(t => /\d/.test(t) || (t.includes('-') && t.length >= 4))
    .map(t => t.toUpperCase());
}

function assessConfidence(productName: string, resultTitle: string): 'high' | 'low' {
  const tokens = keyTokens(productName);
  if (tokens.length === 0) return 'low'; // no discriminating tokens → can't judge

  const titleUpper = resultTitle.toUpperCase();
  // 'high' if ALL key tokens appear in the result title
  const allMatch = tokens.every(t => titleUpper.includes(t));
  return allMatch ? 'high' : 'low';
}

// ── Amazon PA-API ─────────────────────────────────────────────────────────────

/**
 * Attempt an Amazon PA-API lookup.
 * Returns null if the key is not configured OR if the feature isn't implemented
 * yet — the caller falls back to SerpAPI gracefully.
 *
 * TODO: Implement full PA-API signing (HMAC-SHA256) when AWS keys are filled in.
 * For now this is a no-op stub that returns null, which triggers the SerpAPI path.
 */
async function lookupViaAmazon(
  _productName: string,
  _category: string,
): Promise<PriceLookupResult | null> {
  const key = process.env.AWS_PRODUCT_ADVERTISING_KEY ?? '';
  if (!key) {
    return null; // Not configured — skip silently
  }

  // PA-API requires request signing; implementation pending key provisioning.
  // Returning null causes the caller to fall back to SerpAPI.
  console.log('[priceLookup] PA-API key found but implementation is pending — falling back to SerpAPI');
  return null;
}

// ── SerpAPI ───────────────────────────────────────────────────────────────────

async function lookupViaSerpApi(
  productName: string,
): Promise<PriceLookupResult | null> {
  const results = await searchGoogleShopping(productName + ' price india');
  if (results.length === 0) return null;

  // Take the first result with a parseable price
  for (const r of results) {
    const price = parsePrice(r.price);
    if (price !== null && price > 0) {
      return {
        price,
        inStock:         true,   // SerpAPI presence implies in-stock
        source:          'serpapi',
        matchConfidence: assessConfidence(productName, r.title),
        matchedTitle:    r.title,
      };
    }
  }

  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Look up the current Indian market price for a product.
 *
 * Returns null (not a throw) if nothing usable is found, so the caller
 * can decide what to do (log, skip, retry) without crashing the batch.
 */
export async function lookupPrice(
  productName: string,
  category: string,
): Promise<PriceLookupResult | null> {
  try {
    // 1. Try PA-API first (if configured)
    const paResult = await lookupViaAmazon(productName, category);
    if (paResult) return paResult;

    // 2. Fall back to SerpAPI
    return await lookupViaSerpApi(productName);
  } catch (err) {
    // Surface as null so the caller's try/catch handles it gracefully
    console.warn(`[priceLookup] ${productName}: ${(err as Error).message}`);
    return null;
  }
}
