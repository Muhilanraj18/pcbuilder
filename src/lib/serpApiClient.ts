/**
 * src/lib/serpApiClient.ts
 *
 * Shared SerpAPI Google Shopping client.
 * Extracted from scripts/serpapi_price_lookup.js so both the CLI batch job
 * and the API cron route can import the same logic without duplication.
 */

export interface ShoppingResult {
  title:           string;
  price:           string | number | null;
  extracted_price?: number | null;
  source:          string;
  merchant?:       string;
  link:            string;
  [key: string]:   unknown;           // SerpAPI may return additional fields
}

/**
 * Search Google Shopping via SerpAPI.
 * Returns up to 5 results for the given query.
 * Throws if SERP_API_KEY is not set or the request fails.
 */
export async function searchGoogleShopping(query: string): Promise<ShoppingResult[]> {
  const apiKey = process.env.SERP_API_KEY ?? '';
  if (!apiKey) {
    throw new Error('SERP_API_KEY is not configured');
  }

  const url = new URL('https://serpapi.com/search.json');
  url.search = new URLSearchParams({
    engine:        'google_shopping',
    q:             query,
    google_domain: 'google.co.in',
    hl:            'en',
    gl:            'in',
    api_key:       apiKey,
  }).toString();

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { shopping_results?: ShoppingResult[] };
  const results = Array.isArray(data.shopping_results) ? data.shopping_results : [];

  return results.slice(0, 5).map(item => ({
    title:  item.title  ?? 'Unknown product',
    price:  item.price ?? item.extracted_price ?? null,
    source: item.source ?? item.merchant ?? 'Google Shopping',
    link:   item.link   ?? '',
  }));
}

/**
 * Parse a price string like "₹27,999" or "27999.0" into an integer (INR paise-free).
 * Returns null if parsing fails.
 */
export function parsePrice(raw: string | number | null): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Math.round(raw);
  // Remove currency symbols, commas, spaces
  const cleaned = String(raw).replace(/[₹,\s]/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : Math.round(n);
}
