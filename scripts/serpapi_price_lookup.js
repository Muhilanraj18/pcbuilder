/**
 * SerpAPI Google Shopping helper for PC Builder.
 *
 * Usage:
 *   node scripts/serpapi_price_lookup.js "RTX 4060"
 *
 * Reads SERP_API_KEY or NEXT_PUBLIC_SERPAPI_KEY from the environment,
 * or from .env.local in the project root.
 */

const fs = require('fs');
const path = require('path');

function loadLocalEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) {
      continue;
    }

    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getApiKey() {
  return process.env.SERP_API_KEY || process.env.NEXT_PUBLIC_SERPAPI_KEY || '';
}

async function searchGoogleShopping(query) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing SERP_API_KEY or NEXT_PUBLIC_SERPAPI_KEY');
  }

  const url = new URL('https://serpapi.com/search.json');
  url.search = new URLSearchParams({
    engine: 'google_shopping',
    q: query,
    google_domain: 'google.co.in',
    hl: 'en',
    gl: 'in',
    api_key: apiKey,
  }).toString();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const results = Array.isArray(data.shopping_results) ? data.shopping_results : [];

  return results.slice(0, 5).map((item) => ({
    title: item.title || 'Unknown product',
    price: item.price || item.extracted_price || null,
    source: item.source || item.merchant || 'Google Shopping',
    link: item.link || '',
  }));
}

async function main() {
  loadLocalEnv();

  const query = process.argv.slice(2).join(' ').trim() || 'RTX 4060';
  const results = await searchGoogleShopping(query);

  console.log(JSON.stringify({ query, results }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});