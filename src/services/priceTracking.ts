/**
 * Real-Time Price Tracking Service
 * Connects to multiple Indian e-commerce APIs for live pricing
 */

export interface PriceSource {
  source: string;
  price: number;
  url: string;
  inStock: boolean;
  lastUpdated: Date;
}

/**
 * Get real-time prices from multiple sources
 * Supports: Amazon, Flipkart, MDComputers, and price aggregators
 */
export async function getRealTimePrices(
  productName: string,
  category: string
): Promise<PriceSource[]> {
  const results: PriceSource[] = [];
  
  try {
    // Source 1: server-side price API (keeps provider keys off the client)
    try {
      const serpResults = await fetchFromSerpAPI(productName, category);
      results.push(...serpResults);
    } catch (error) {
      console.warn('SerpAPI fetch failed:', error);
    }
    
    // Source 2: Direct Amazon API (requires AWS credentials)
    if (process.env.NEXT_PUBLIC_AWS_PRODUCT_ADVERTISING_KEY) {
      try {
        const amazonResults = await fetchFromAmazonAPI(productName);
        results.push(...amazonResults);
      } catch (error) {
        console.warn('Amazon API fetch failed:', error);
      }
    }
    
    // Source 3: Flipkart Integration (if available)
    if (process.env.NEXT_PUBLIC_FLIPKART_KEY) {
      try {
        const flipkartResults = await fetchFromFlipkartAPI(productName);
        results.push(...flipkartResults);
      } catch (error) {
        console.warn('Flipkart fetch failed:', error);
      }
    }
    
    // Source 4: MDComputers Direct (web scraping)
    if (process.env.NEXT_PUBLIC_ENABLE_MDCOMPUTERS === 'true') {
      try {
        const mdResults = await fetchFromMDComputers(productName);
        results.push(...mdResults);
      } catch (error) {
        console.warn('MDComputers fetch failed:', error);
      }
    }
    
    return results.length > 0 ? results : getFallbackPrices(productName);
  } catch (error) {
    console.error('Error fetching real-time prices:', error);
    return getFallbackPrices(productName);
  }
}

/**
 * Fetch prices from SerpAPI (Google Shopping)
 */
async function fetchFromSerpAPI(productName: string, category: string): Promise<PriceSource[]> {
  const params = new URLSearchParams({
    product: productName,
    ...(category && { category }),
  });
  const response = await fetch(`/api/price?${params.toString()}`);
  if (!response.ok) throw new Error('Price API request failed');

  const data = await response.json();
  if (!data || !data.price) {
    return [];
  }

  return [
    {
      source: data.source || 'Live Price',
      price: data.price,
      url: data.sources?.[0]?.url || '',
      inStock: true,
      lastUpdated: new Date(),
    },
  ];
}

/**
 * Fetch prices from Amazon Product Advertising API
 */
async function fetchFromAmazonAPI(productName: string): Promise<PriceSource[]> {
  try {
    const response = await fetch('/api/amazon-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: productName }),
    });
    
    if (!response.ok) throw new Error('Amazon API request failed');
    
    const data = await response.json();
    return data.prices || [];
  } catch (error) {
    console.warn('Amazon API error:', error);
    return [];
  }
}

/**
 * Fetch prices from Flipkart
 */
async function fetchFromFlipkartAPI(productName: string): Promise<PriceSource[]> {
  try {
    const response = await fetch('/api/flipkart-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: productName }),
    });
    
    if (!response.ok) throw new Error('Flipkart API request failed');
    
    const data = await response.json();
    return data.prices || [];
  } catch (error) {
    console.warn('Flipkart API error:', error);
    return [];
  }
}

/**
 * Fetch prices from MDComputers
 */
async function fetchFromMDComputers(productName: string): Promise<PriceSource[]> {
  try {
    const response = await fetch('/api/mdcomputers-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: productName }),
    });
    
    if (!response.ok) throw new Error('MDComputers request failed');
    
    const data = await response.json();
    return data.prices || [];
  } catch (error) {
    console.warn('MDComputers error:', error);
    return [];
  }
}

/**
 * Fallback prices when APIs are unavailable
 */
function getFallbackPrices(productName: string): PriceSource[] {
  console.log(`Using fallback prices for: ${productName}`);
  return [
    {
      source: 'Cached Prices',
      price: 0, // Will be populated from database
      url: '',
      inStock: true,
      lastUpdated: new Date(),
    },
  ];
}

/**
 * Get best price from multiple sources
 */
export async function getBestPrice(productName: string, category: string): Promise<{ price: number; source: string; url: string }> {
  const prices = await getRealTimePrices(productName, category);
  const inStockPrices = prices.filter(p => p.inStock && p.price > 0);
  
  if (inStockPrices.length === 0) {
    throw new Error('Product out of stock everywhere');
  }
  
  // Return best deal from in-stock sources
  const bestDeal = inStockPrices.reduce((best, current) =>
    current.price < best.price ? current : best
  );
  
  return {
    price: bestDeal.price,
    source: bestDeal.source,
    url: bestDeal.url,
  };
}

/**
 * Price comparison services configured:
 * 
 * 1. Price API proxy (RECOMMENDED)
 *    - Set SERP_API_KEY on the server only
 *    - Free tier depends on SerpAPI plan
 * 
 * 2. Amazon Product Advertising API
 *    - Requires AWS credentials
 *    - Set NEXT_PUBLIC_AWS_PRODUCT_ADVERTISING_KEY
 * 
 * 3. Flipkart API (if available)
 *    - Set NEXT_PUBLIC_FLIPKART_KEY
 * 
 * 4. MDComputers Direct Scraping
 *    - Set NEXT_PUBLIC_ENABLE_MDCOMPUTERS=true
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Get SerpAPI key at https://serpapi.com (recommended for Indian market)
 * 2. Add to .env.local:
 *    SERP_API_KEY=your_key_here
 * 3. Component will auto-fetch real-time prices every 3 minutes
 */

/**
 * Example: Simple cache-based pricing
 */
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export async function getCachedPrice(productId: string): Promise<number | null> {
  const cached = priceCache.get(productId);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.price;
  }
  
  return null;
}

export function updatePriceCache(productId: string, price: number): void {
  priceCache.set(productId, {
    price,
    timestamp: Date.now(),
  });
}

/**
 * Format price for display with last update time
 */
export function formatPriceWithUpdate(price: number, lastUpdated: Date): string {
  const hours = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60));
  
  let updateText = '';
  if (hours < 1) {
    updateText = 'Updated just now';
  } else if (hours < 24) {
    updateText = `Updated ${hours}h ago`;
  } else {
    updateText = `Updated ${Math.floor(hours / 24)}d ago`;
  }
  
  return `₹${price.toLocaleString('en-IN')} • ${updateText}`;
}

export default {
  getRealTimePrices,
  getBestPrice,
  getCachedPrice,
  updatePriceCache,
  formatPriceWithUpdate,
};
