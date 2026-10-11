const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "";
const FLIPKART_AFFILIATE_ID = process.env.NEXT_PUBLIC_FLIPKART_AFFILIATE_ID || "";

function appendParams(url: URL, params: Record<string, string>) {
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
}

export function buildAffiliateUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;

  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();

    appendParams(url, {
      utm_source: "pcbuilder_india",
      utm_medium: "affiliate",
      utm_campaign: "component_links",
    });

    if (hostname.includes("amazon.")) {
      appendParams(url, { tag: AMAZON_TAG });
    }

    if (hostname.includes("flipkart.")) {
      appendParams(url, { affid: FLIPKART_AFFILIATE_ID });
    }

    if (hostname.includes("mdcomputers.")) {
      appendParams(url, { ref: "pcbuilder_india" });
    }

    if (hostname.includes("primeabgb.")) {
      appendParams(url, { ref: "pcbuilder_india" });
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function buildGoogleMapsDirections(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}

// Get platform display name from URL
export function getPlatformName(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("amazon")) return "Amazon";
    if (hostname.includes("flipkart")) return "Flipkart";
    if (hostname.includes("mdcomputers")) return "MDComputers";
    if (hostname.includes("primeabgb")) return "PrimeABGB";
    return "Store";
  } catch {
    return "Store";
  }
}

// Platform brand colors for buy buttons
export function getPlatformColor(platform: string): { bg: string; hover: string; text: string } {
  switch (platform.toLowerCase()) {
    case "amazon": return { bg: "bg-[#FF9900]", hover: "hover:bg-[#e88a00]", text: "text-black" };
    case "flipkart": return { bg: "bg-[#2874F0]", hover: "hover:bg-[#1a5dc7]", text: "text-white" };
    case "mdcomputers": return { bg: "bg-[#E31E24]", hover: "hover:bg-[#c41a1f]", text: "text-white" };
    case "primeabgb": return { bg: "bg-[#1B1B1B]", hover: "hover:bg-[#333]", text: "text-white" };
    default: return { bg: "bg-primary-600", hover: "hover:bg-primary-700", text: "text-white" };
  }
}
