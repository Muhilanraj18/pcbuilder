import type { NextApiRequest, NextApiResponse } from "next";
import { buildAffiliateUrl } from "@/utils/affiliate";

interface AmazonPriceResponse {
  prices?: Array<{
    source: string;
    price: number;
    url: string;
    inStock: boolean;
    lastUpdated: Date;
  }>;
  error?: string;
}

function normalizePrice(value: string | number | undefined): number | null {
  if (value === undefined || value === null) return null;
  const parsed = Number.parseFloat(String(value).replace(/Rs\.?/gi, "").replace(/[₹,\s]/g, "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AmazonPriceResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { product } = req.body;

  if (!product || typeof product !== "string") {
    return res.status(400).json({ error: "Product name is required" });
  }

  try {
    const key = process.env.SERP_API_KEY || process.env.SERPAPI_KEY;
    if (!key) {
      console.warn("SerpAPI is not configured");
      return res.status(200).json({ prices: [] });
    }

    const query = encodeURIComponent(`${product} site:amazon.in`);
    const url = `https://serpapi.com/search.json?engine=google_shopping&google_domain=google.co.in&q=${query}&api_key=${key}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(200).json({ prices: [] });
    }

    const data = await response.json();
    const items = Array.isArray(data.shopping_results) ? data.shopping_results : [];
    const prices = items
      .map((item: any) => {
        const rawLink = String(item?.link || "");
        const price = normalizePrice(item?.price);
        if (!rawLink || !price || !rawLink.toLowerCase().includes("amazon")) return null;
        return {
          source: "Amazon.in",
          price,
          url: buildAffiliateUrl(rawLink),
          inStock: true,
          lastUpdated: new Date(),
        };
      })
      .filter((entry: any) => Boolean(entry))
      .slice(0, 5);

    return res.status(200).json({
      prices,
    });
  } catch (error) {
    console.error("Amazon price fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch Amazon prices" });
  }
}
