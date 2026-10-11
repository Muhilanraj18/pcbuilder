export function cleanProductName(name: string): string {
  if (!name || typeof name !== "string") return "";

  let cleaned = name.trim();

  // SPECIAL CASES
  if (cleaned.toLowerCase().includes("hp v20")) {
    return "HP V20 19.5 inch Monitor";
  }
  if (cleaned.toLowerCase().includes("power supply") || cleaned.toLowerCase().includes("550w")) {
    return "Corsair CV550 550W 80+ Bronze PSU";
  }
  if (cleaned.toLowerCase().includes("nvme")) {
    const match = cleaned.match(/(\d+)gb/i);
    return `${match ? match[1] : "512"}GB NVMe SSD`;
  }
  if (cleaned.toLowerCase().includes("ddr4")) {
    const match = cleaned.match(/(\d+)gb/i);
    return `${match ? match[1] : "16"}GB DDR4 RAM`;
  }

  // Remove duplicate words
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, "$1");

  // Fix GPU spacing (RTX 20 60 → RTX 2060)
  cleaned = cleaned.replace(/\b(RTX|GTX|RX)\s+(\d)\s+(\d{2,3})\b/gi, "$1$2$3");
  cleaned = cleaned.replace(/\b(RTX|GTX|RX)\s+(\d{2})\s+(\d{2})\b/gi, "$1$2$3");

  // Remove bracket content
  cleaned = cleaned.replace(/\s*\([^)]*\)\s*/g, " ");

  // Remove model variations
  cleaned = cleaned.replace(/\s+(HD|FHD|4K|Ultra|Pro|Max|Plus|Standard)\+?\b/gi, "");

  // Normalize spacing
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}

export function generateSearchQuery(name: string): string {
  const cleaned = cleanProductName(name);
  return `${cleaned} price India buy online`;
}

export const LIVE_PRICE_CATEGORIES = ["Processor", "Graphics Card", "Motherboard", "Storage", "Power Supply", "Monitor", "RAM", "PSU"];

export function shouldFetchLivePrice(category: string): boolean {
  return LIVE_PRICE_CATEGORIES.includes(category);
}

export default { cleanProductName, generateSearchQuery, shouldFetchLivePrice, LIVE_PRICE_CATEGORIES };
