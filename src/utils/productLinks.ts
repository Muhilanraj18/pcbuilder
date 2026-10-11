// ⚠️ SUPERSEDED by Postgres Product table as of 2026-07-14.
// No longer read by build.ts — buy links and image URLs are now stored in the
// Product table (amazonUrl, flipkartUrl, mdcomputersUrl, imageUrl columns).
// Safe to delete after 2026-07-28 once production is confirmed stable.
//
// Product links and images for affiliate marketing
// Maps product names to real Amazon.in / Flipkart buy URLs and product images.
// 
// IMPORTANT: Only products with REAL image URLs are entered here.
// For anything not in this database, getProductInfo() returns empty imageUrl ("").
// The UI renders a proper SVG category icon for products with no image —
// there is NO placehold.co or colored-box fallback.
import type { BuyLinks } from '@/types';

export interface ProductInfo {
  buyLinks: BuyLinks;
  imageUrl: string;
  releaseYear: number;
  brand: string;
}

// Helper to build search URLs when we don't have an exact product page link
function amazonSearch(q: string): string {
  return `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;
}
function flipkartSearch(q: string): string {
  return `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`;
}
function mdcSearch(q: string): string {
  return `https://www.mdcomputers.in/index.php?search=${encodeURIComponent(q)}`;
}

export function getProductInfo(name: string): ProductInfo {
  const info = productDatabase[name];
  if (info) return info;

  // Unknown product — return search URLs and empty imageUrl.
  // The UI will render a category SVG icon. No placeholder image URL is generated.
  const brand = name.split(' ')[0] || 'Generic';
  return {
    buyLinks: {
      amazon: amazonSearch(name),
      flipkart: flipkartSearch(name),
      mdcomputers: mdcSearch(name),
    },
    imageUrl: '', // empty → UI renders category icon
    releaseYear: 2023,
    brand,
  };
}

export const productDatabase: Record<string, ProductInfo> = {
  // === PROCESSORS ===
  "Intel Core i3-12100F": {
    buyLinks: { amazon: "https://www.amazon.in/dp/B09NPJX7PV", flipkart: flipkartSearch("Intel Core i3-12100F"), mdcomputers: "https://www.mdcomputers.in/intel-core-i3-12100f.html" },
    imageUrl: '', releaseYear: 2022, brand: "Intel"
  },
  "AMD Ryzen 3 4100": {
    buyLinks: { amazon: "https://www.amazon.in/dp/B09RD3RLJM", flipkart: flipkartSearch("AMD Ryzen 3 4100"), mdcomputers: mdcSearch("AMD Ryzen 3 4100") },
    imageUrl: '', releaseYear: 2022, brand: "AMD"
  },
  "AMD Ryzen 5 5600G": {
    buyLinks: { amazon: "https://www.amazon.in/dp/B09JSKT97S", flipkart: flipkartSearch("AMD Ryzen 5 5600G"), mdcomputers: "https://www.mdcomputers.in/amd-ryzen-5-5600g.html" },
    imageUrl: '', releaseYear: 2021, brand: "AMD"
  },
  "Intel Core i5-12400F": {
    buyLinks: { amazon: "https://www.amazon.in/dp/B09NPJX7PV", flipkart: flipkartSearch("Intel Core i5-12400F"), mdcomputers: "https://www.mdcomputers.in/intel-core-i5-12400f.html" },
    imageUrl: '', releaseYear: 2022, brand: "Intel"
  },
  "AMD Ryzen 5 5600": {
    buyLinks: { amazon: amazonSearch("AMD Ryzen 5 5600"), flipkart: flipkartSearch("AMD Ryzen 5 5600"), mdcomputers: mdcSearch("AMD Ryzen 5 5600") },
    imageUrl: '', releaseYear: 2022, brand: "AMD"
  },
  "AMD Ryzen 7 5700X": {
    buyLinks: { amazon: "https://www.amazon.in/dp/B09VCHQHZ6", flipkart: flipkartSearch("AMD Ryzen 7 5700X"), mdcomputers: mdcSearch("AMD Ryzen 7 5700X") },
    imageUrl: '', releaseYear: 2022, brand: "AMD"
  },
  "Intel Core i5-13600KF": {
    buyLinks: { amazon: amazonSearch("Intel Core i5-13600KF"), flipkart: flipkartSearch("Intel Core i5-13600KF"), mdcomputers: mdcSearch("Intel Core i5-13600KF") },
    imageUrl: '', releaseYear: 2022, brand: "Intel"
  },
  "Intel Core i7-13700K": {
    buyLinks: { amazon: amazonSearch("Intel Core i7-13700K"), flipkart: flipkartSearch("Intel Core i7-13700K"), mdcomputers: mdcSearch("Intel Core i7-13700K") },
    imageUrl: '', releaseYear: 2022, brand: "Intel"
  },
  "Intel Core i9-13900K": {
    buyLinks: { amazon: amazonSearch("Intel Core i9-13900K"), flipkart: flipkartSearch("Intel Core i9-13900K"), mdcomputers: mdcSearch("Intel Core i9-13900K") },
    imageUrl: '', releaseYear: 2022, brand: "Intel"
  },
  "AMD Ryzen 9 7950X": {
    buyLinks: { amazon: amazonSearch("AMD Ryzen 9 7950X"), flipkart: flipkartSearch("AMD Ryzen 9 7950X"), mdcomputers: mdcSearch("AMD Ryzen 9 7950X") },
    imageUrl: '', releaseYear: 2022, brand: "AMD"
  },

  // === GRAPHICS CARDS ===
  "MSI GeForce GTX 1650 4GB Ventus XS OC": {
    buyLinks: { amazon: amazonSearch("MSI GTX 1650 Ventus XS OC"), flipkart: flipkartSearch("MSI GTX 1650 Ventus XS"), mdcomputers: mdcSearch("MSI GTX 1650 Ventus") },
    imageUrl: '', releaseYear: 2019, brand: "MSI"
  },
  "ZOTAC Gaming GeForce RTX 4060 8GB Twin Edge OC": {
    buyLinks: { amazon: amazonSearch("ZOTAC RTX 4060 Twin Edge"), flipkart: flipkartSearch("ZOTAC RTX 4060 Twin Edge"), mdcomputers: mdcSearch("ZOTAC RTX 4060") },
    imageUrl: '', releaseYear: 2023, brand: "ZOTAC"
  },
  "ZOTAC Gaming GeForce RTX 4070 Twin Edge OC 12GB": {
    buyLinks: { amazon: amazonSearch("ZOTAC RTX 4070 Twin Edge"), flipkart: flipkartSearch("ZOTAC RTX 4070"), mdcomputers: mdcSearch("ZOTAC RTX 4070") },
    imageUrl: '', releaseYear: 2023, brand: "ZOTAC"
  },
  "Sapphire Pulse AMD Radeon RX 7600 8GB": {
    buyLinks: { amazon: amazonSearch("Sapphire Pulse RX 7600"), flipkart: flipkartSearch("Sapphire RX 7600"), mdcomputers: mdcSearch("Sapphire RX 7600") },
    imageUrl: '', releaseYear: 2023, brand: "Sapphire"
  },
  "ASUS ROG STRIX GeForce RTX 4090 24GB OC": {
    buyLinks: { amazon: amazonSearch("ASUS ROG STRIX RTX 4090"), flipkart: flipkartSearch("ASUS ROG STRIX RTX 4090"), mdcomputers: mdcSearch("ASUS ROG STRIX RTX 4090") },
    imageUrl: '', releaseYear: 2022, brand: "ASUS"
  },

  // === MONITORS ===
  "Acer Nitro VG240Y 24\" FHD IPS 165Hz": {
    buyLinks: { amazon: amazonSearch("Acer Nitro VG240Y 165Hz"), flipkart: flipkartSearch("Acer Nitro VG240Y"), mdcomputers: mdcSearch("Acer Nitro VG240Y") },
    imageUrl: '', releaseYear: 2022, brand: "Acer"
  },
  "LG 24GN650 UltraGear 24\" FHD IPS 144Hz": {
    buyLinks: { amazon: amazonSearch("LG 24GN650 UltraGear 144Hz"), flipkart: flipkartSearch("LG 24GN650"), mdcomputers: mdcSearch("LG 24GN650") },
    imageUrl: '', releaseYear: 2021, brand: "LG"
  },

  // === POWER SUPPLIES ===
  "Corsair CV450 450W 80+ Bronze": {
    buyLinks: { amazon: amazonSearch("Corsair CV450"), flipkart: flipkartSearch("Corsair CV450"), mdcomputers: mdcSearch("Corsair CV450") },
    imageUrl: '', releaseYear: 2020, brand: "Corsair"
  },
  "Corsair RM750 750W 80+ Gold Fully Modular": {
    buyLinks: { amazon: amazonSearch("Corsair RM750 Gold"), flipkart: flipkartSearch("Corsair RM750"), mdcomputers: mdcSearch("Corsair RM750") },
    imageUrl: '', releaseYear: 2021, brand: "Corsair"
  },

  // === RAM ===
  "Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz": {
    buyLinks: { amazon: amazonSearch("Corsair Vengeance LPX 16GB 3200"), flipkart: flipkartSearch("Corsair Vengeance LPX 16GB DDR4"), mdcomputers: mdcSearch("Corsair Vengeance LPX 16GB") },
    imageUrl: '', releaseYear: 2018, brand: "Corsair"
  },
  "Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz": {
    buyLinks: { amazon: amazonSearch("Kingston FURY Beast 16GB DDR4"), flipkart: flipkartSearch("Kingston FURY Beast 16GB"), mdcomputers: mdcSearch("Kingston FURY Beast 16GB") },
    imageUrl: '', releaseYear: 2021, brand: "Kingston"
  },

  // === STORAGE ===
  "Samsung 970 EVO Plus 1TB NVMe M.2 SSD": {
    buyLinks: { amazon: amazonSearch("Samsung 970 EVO Plus 1TB"), flipkart: flipkartSearch("Samsung 970 EVO Plus 1TB"), mdcomputers: mdcSearch("Samsung 970 EVO Plus 1TB") },
    imageUrl: '', releaseYear: 2019, brand: "Samsung"
  },
  "WD Black SN770 1TB NVMe M.2 SSD": {
    buyLinks: { amazon: amazonSearch("WD Black SN770 1TB"), flipkart: flipkartSearch("WD Black SN770 1TB"), mdcomputers: mdcSearch("WD Black SN770 1TB") },
    imageUrl: '', releaseYear: 2022, brand: "WD"
  },

  // === CABINETS ===
  "Corsair 4000D Airflow": {
    buyLinks: { amazon: amazonSearch("Corsair 4000D Airflow"), flipkart: flipkartSearch("Corsair 4000D Airflow"), mdcomputers: mdcSearch("Corsair 4000D Airflow") },
    imageUrl: '', releaseYear: 2020, brand: "Corsair"
  },

  // === COOLING ===
  "Cooler Master Hyper 212 EVO V2": {
    buyLinks: { amazon: amazonSearch("Cooler Master Hyper 212 EVO V2"), flipkart: flipkartSearch("Cooler Master Hyper 212"), mdcomputers: mdcSearch("Cooler Master Hyper 212") },
    imageUrl: '', releaseYear: 2020, brand: "Cooler Master"
  },
};

export default productDatabase;
