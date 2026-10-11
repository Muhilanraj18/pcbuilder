import type { NextApiRequest, NextApiResponse } from "next";

interface MDComputersPriceResponse {
  prices?: Array<{
    source: string;
    price: number;
    url: string;
    inStock: boolean;
    lastUpdated: Date;
  }>;
  error?: string;
}

/**
 * Fetch prices from MDComputers
 * 
 * SETUP:
 * 1. Set NEXT_PUBLIC_ENABLE_MDCOMPUTERS=true in .env.local
 * 2. Consider using Puppeteer or similar for JavaScript-heavy sites
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MDComputersPriceResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { product } = req.body;

  if (!product || typeof product !== "string") {
    return res.status(400).json({ error: "Product name is required" });
  }

  try {
    // Check if MDComputers scraping is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_MDCOMPUTERS !== "true") {
      return res.status(200).json({ prices: [] });
    }

    // TODO: Implement MDComputers scraping
    // Example approach:
    /*
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(
      `https://www.mdcomputers.in/search?q=${encodeURIComponent(product)}`
    );
    
    const prices = await page.evaluate(() => {
      return document.querySelectorAll('.product-item').map(item => ({
        name: item.querySelector('.product-name')?.textContent || '',
        price: parseFloat(
          item.querySelector('.product-price')?.textContent?.replace(/[₹,]/g, '') || '0'
        ),
        url: item.querySelector('a')?.href || '',
      }));
    });
    
    await browser.close();
    */

    // Fallback: Return mock data
    return res.status(200).json({
      prices: [
        {
          source: "MDComputers",
          price: 0,
          url: "https://mdcomputers.in/search?q=" + encodeURIComponent(product),
          inStock: false,
          lastUpdated: new Date(),
        },
      ],
    });
  } catch (error) {
    console.error("MDComputers price fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch MDComputers prices" });
  }
}
