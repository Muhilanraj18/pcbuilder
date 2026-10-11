// ⚠️ SUPERSEDED by Postgres Product table as of 2026-07-14.
// No longer read by build.ts — all recommendation logic now uses getEligibleProducts()
// from src/lib/catalog.ts.  Safe to delete after 2026-07-28 once production is confirmed stable.
//
// Real Indian Market Component Prices — Updated April 2026
// All prices in Indian Rupees (₹) sourced from Amazon.in, Flipkart, MDComputers, PrimeABGB
// Last Updated: April 24, 2026

export interface ComponentPrice {
  [key: string]: number;
}

export interface TieredComponents {
  budget: ComponentPrice;
  midRange: ComponentPrice;
  highEnd: ComponentPrice;
  enthusiast: ComponentPrice;
}

export interface RAMComponents {
  ddr4: ComponentPrice;
  ddr5: ComponentPrice;
}

export interface StorageComponents {
  ssd: ComponentPrice;
  nvme: ComponentPrice;
  hdd: ComponentPrice;
}

export const componentPrices = {
  processors: {
    budget: {
      "Intel Core i3-12100F": 7499,
      "AMD Ryzen 3 4100": 6899,
      "Intel Core i3-10100F": 6299,
      "AMD Ryzen 5 4500": 8499,
      "Intel Core i3-12100": 9999,
      "AMD Ryzen 3 3300X": 7999,
      "Intel Core i3-13100F": 8799,
      "AMD Ryzen 5 3500": 7299,
    },
    midRange: {
      "AMD Ryzen 5 5600G": 13499,
      "Intel Core i5-12400F": 13999,
      "AMD Ryzen 5 5600": 12999,
      "AMD Ryzen 5 5600X": 15499,
      "Intel Core i5-12400": 15999,
      "Intel Core i5-13400F": 16499,
      "AMD Ryzen 5 5500": 11499,
      "Intel Core i5-12500": 17499,
      "AMD Ryzen 5 7600": 19999,
      "Intel Core i5-13500": 19499,
    },
    highEnd: {
      "AMD Ryzen 7 5700X": 20499,
      "Intel Core i5-13600KF": 23999,
      "AMD Ryzen 7 5800X": 22999,
      "Intel Core i7-12700F": 25499,
      "Intel Core i5-13600K": 26499,
      "AMD Ryzen 7 5800X3D": 29999,
      "Intel Core i7-12700KF": 27999,
      "AMD Ryzen 7 7700X": 28999,
      "Intel Core i7-13700F": 30999,
    },
    enthusiast: {
      "Intel Core i7-13700K": 34999,
      "AMD Ryzen 9 5900X": 32999,
      "Intel Core i9-13900K": 49999,
      "AMD Ryzen 9 7950X": 54999,
      "Intel Core i9-13900KF": 47999,
      "AMD Ryzen 9 7900X": 39999,
      "Intel Core i7-13700KF": 32999,
      "AMD Ryzen 9 5950X": 44999,
      "Intel Core i9-14900K": 52999,
    },
  },

  graphicsCards: {
    budget: {
      "ZOTAC GeForce GT 1030 2GB": 5999,
      "MSI GeForce GTX 1650 4GB Ventus XS OC": 12499,
      "Gigabyte GeForce GTX 1650 D6 OC 4GB": 12999,
      "ZOTAC Gaming GeForce GTX 1650 OC 4GB": 12799,
      "ASRock AMD Radeon RX 6500 XT 4GB": 13499,
      "ASUS Dual GeForce RTX 3050 8GB": 19999,
      "MSI GeForce RTX 3050 VENTUS 2X 8GB OC": 19499,
      "Gigabyte GeForce RTX 3050 Eagle OC 8GB": 19799,
    },
    midRange: {
      "ZOTAC Gaming GeForce RTX 4060 8GB Twin Edge OC": 27999,
      "MSI GeForce RTX 4060 VENTUS 2X BLACK 8GB OC": 28499,
      "Gigabyte GeForce RTX 4060 Eagle OC 8GB": 28999,
      "ASUS Dual GeForce RTX 4060 8GB": 29499,
      "Sapphire Pulse AMD Radeon RX 7600 8GB": 24999,
      "PowerColor Fighter AMD Radeon RX 6600 8GB": 19999,
      "MSI GeForce RTX 3060 VENTUS 2X 12GB OC": 24499,
      "Gigabyte GeForce RTX 3060 Eagle OC 12GB": 24999,
      "ASUS Dual AMD Radeon RX 7600 8GB OC": 25999,
    },
    highEnd: {
      "ZOTAC Gaming GeForce RTX 4070 Twin Edge OC 12GB": 49999,
      "MSI GeForce RTX 4070 VENTUS 2X 12GB OC": 50499,
      "Gigabyte GeForce RTX 4070 Eagle OC 12GB": 51999,
      "Sapphire Nitro+ AMD Radeon RX 7800 XT 16GB": 45999,
      "ASUS TUF Gaming GeForce RTX 4070 Ti 12GB OC": 67999,
      "MSI GeForce RTX 4070 Ti VENTUS 2X 12GB OC": 66999,
      "Gigabyte GeForce RTX 4070 SUPER Eagle OC 12GB": 55999,
      "PowerColor Red Devil AMD Radeon RX 7800 XT 16GB": 47999,
    },
    enthusiast: {
      "ASUS TUF Gaming GeForce RTX 4080 SUPER 16GB OC": 99999,
      "MSI GeForce RTX 4080 SUPER VENTUS 3X 16GB OC": 97999,
      "Gigabyte GeForce RTX 4080 SUPER Eagle OC 16GB": 98999,
      "ASUS ROG STRIX GeForce RTX 4090 24GB OC": 179999,
      "MSI GeForce RTX 4090 SUPRIM X 24GB": 174999,
      "Gigabyte GeForce RTX 4090 Gaming OC 24GB": 169999,
      "Sapphire Nitro+ AMD Radeon RX 7900 XTX 24GB": 89999,
      "ASRock AMD Radeon RX 7900 XT 20GB": 74999,
    },
  },

  motherboards: {
    budget: {
      "MSI PRO H610M-E DDR4 (Intel)": 5999,
      "Gigabyte H610M S2H DDR4 (Intel)": 6499,
      "ASUS PRIME H610M-E D4 (Intel)": 6999,
      "ASRock H610M-HDV/M.2 (Intel)": 6299,
      "Gigabyte A520M DS3H (AMD)": 5499,
      "MSI A520M-A PRO (AMD)": 5299,
      "ASRock B450M-HDV R4.0 (AMD)": 5999,
      "ASUS PRIME A520M-K (AMD)": 5799,
    },
    midRange: {
      "MSI PRO B660M-A DDR4 (Intel)": 11999,
      "ASUS TUF Gaming B660M-PLUS D4 (Intel)": 13499,
      "Gigabyte B660M DS3H DDR4 (Intel)": 11499,
      "ASRock B660M Steel Legend (Intel)": 13999,
      "MSI MAG B550M MORTAR (AMD)": 12499,
      "ASUS TUF Gaming B550M-PLUS (AMD)": 11999,
      "Gigabyte B550M AORUS ELITE (AMD)": 12999,
      "ASRock B550M Steel Legend (AMD)": 11499,
    },
    highEnd: {
      "ASUS ROG STRIX Z690-F Gaming WiFi (Intel)": 28999,
      "MSI MAG Z690 TOMAHAWK WiFi (Intel)": 26499,
      "Gigabyte Z690 AORUS ELITE AX DDR4 (Intel)": 24999,
      "ASRock Z690 Steel Legend (Intel)": 22999,
      "ASUS ROG STRIX B550-F Gaming WiFi II (AMD)": 17999,
      "MSI MAG X570S TOMAHAWK WiFi (AMD)": 21999,
      "Gigabyte X570 AORUS ELITE WiFi (AMD)": 20999,
    },
    enthusiast: {
      "ASUS ROG MAXIMUS Z790 HERO (Intel)": 58999,
      "MSI MEG Z790 ACE (Intel)": 64999,
      "Gigabyte Z790 AORUS MASTER (Intel)": 59999,
      "ASUS ROG CROSSHAIR X670E HERO (AMD)": 67999,
      "MSI MEG X670E ACE (AMD)": 72999,
      "Gigabyte X670E AORUS MASTER (AMD)": 69999,
    },
  },

  ram: {
    ddr4: {
      "Corsair Vengeance LPX 8GB DDR4 3200MHz": 1999,
      "Kingston FURY Beast 8GB DDR4 3200MHz": 1899,
      "Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz": 3599,
      "Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz": 3499,
      "G.Skill Ripjaws V 16GB (2x8GB) DDR4 3600MHz": 3999,
      "Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz": 6999,
      "Kingston FURY Beast 32GB (2x16GB) DDR4 3600MHz": 7499,
    },
    ddr5: {
      "Kingston FURY Beast 16GB (2x8GB) DDR5 5600MHz": 4999,
      "Corsair Vengeance 16GB (2x8GB) DDR5 5600MHz": 5299,
      "G.Skill Trident Z5 32GB (2x16GB) DDR5 6000MHz": 10999,
      "Kingston FURY Beast 32GB (2x16GB) DDR5 5600MHz": 8999,
      "Corsair Vengeance 32GB (2x16GB) DDR5 5600MHz": 9499,
      "G.Skill Trident Z5 64GB (2x32GB) DDR5 6000MHz": 21999,
    },
  },

  storage: {
    ssd: {
      "Kingston A400 240GB SATA SSD": 1599,
      "WD Green 480GB SATA SSD": 2499,
      "Samsung 870 EVO 500GB SATA SSD": 3499,
      "Crucial MX500 1TB SATA SSD": 5499,
      "Samsung 870 EVO 1TB SATA SSD": 6499,
      "WD Blue 2TB SATA SSD": 12999,
    },
    nvme: {
      "Kingston NV2 250GB NVMe M.2 SSD": 1799,
      "WD Blue SN580 500GB NVMe M.2 SSD": 3299,
      "Samsung 980 500GB NVMe M.2 SSD": 3499,
      "Samsung 970 EVO Plus 1TB NVMe M.2 SSD": 6999,
      "WD Black SN770 1TB NVMe M.2 SSD": 6499,
      "Samsung 990 PRO 1TB NVMe M.2 SSD": 8999,
      "WD Black SN850X 2TB NVMe M.2 SSD": 14999,
      "Samsung 990 PRO 2TB NVMe M.2 SSD": 16999,
    },
    hdd: {
      "Seagate Barracuda 1TB 7200RPM HDD": 2999,
      "WD Blue 1TB 7200RPM HDD": 2899,
      "Seagate Barracuda 2TB 7200RPM HDD": 4499,
      "WD Blue 2TB 5400RPM HDD": 4299,
      "Seagate Barracuda 4TB 5400RPM HDD": 7999,
    },
  },

  powerSupplies: {
    "Ant Esports VS450L 450W": 1999,
    "Cooler Master MWE 450 Bronze V2 450W": 2799,
    "Corsair CV450 450W 80+ Bronze": 2999,
    "Antec Atom V550 550W": 2799,
    "Cooler Master MWE 550 Bronze V2 550W": 3499,
    "Corsair CV550 550W 80+ Bronze": 3599,
    "Deepcool PF550 550W 80+ Bronze": 3299,
    "Corsair CX650M 650W 80+ Bronze Semi-Modular": 5499,
    "Cooler Master MWE Gold 650 V2 650W 80+ Gold": 5999,
    "Antec HCG 650 Gold 80+ Gold Modular": 6499,
    "Corsair RM750 750W 80+ Gold Fully Modular": 7999,
    "Cooler Master V750 Gold V2 750W 80+ Gold": 7499,
    "Deepcool PX750G 750W 80+ Gold": 6999,
    "Corsair RM850x 850W 80+ Gold Fully Modular": 9999,
    "Cooler Master V850 Gold V2 850W 80+ Gold": 9499,
    "Corsair HX1000 1000W 80+ Platinum Fully Modular": 14999,
    "Seasonic PRIME TX-1000 1000W 80+ Titanium": 19999,
  },

  cabinets: {
    "Ant Esports ICE-120AG": 1999,
    "Deepcool MATREXX 30": 2499,
    "Ant Esports ICE-200TG": 2999,
    "Cooler Master MasterBox Q300L": 3499,
    "Corsair Carbide 175R RGB": 4499,
    "Antec NX410": 4799,
    "NZXT H510": 6499,
    "Lian Li Lancool 215": 6999,
    "Fractal Design Meshify C": 7999,
    "Corsair 4000D Airflow": 8499,
    "be quiet! Pure Base 500DX": 9999,
    "Phanteks Eclipse P400A": 7499,
    "Lian Li O11 Dynamic": 12999,
    "Corsair 5000D Airflow": 13999,
    "Fractal Design Torrent": 17999,
    "Lian Li O11 Dynamic EVO": 18999,
  },

  monitors: {
    "Acer Aopen 20CH1Q 19.5\" HD 60Hz": 5499,
    "LG 22MK430H 22\" FHD IPS 75Hz": 7499,
    "BenQ GW2283 22\" FHD IPS 60Hz": 7999,
    "Samsung LS22C310 22\" FHD IPS 75Hz": 7499,
    "Acer EK220Q 22\" FHD IPS 100Hz": 7999,
    "LG 24MP400 24\" FHD IPS 75Hz": 8999,
    "BenQ GW2480 24\" FHD IPS 75Hz": 9499,
    "Samsung LS24C330 24\" FHD IPS 100Hz": 9999,
    "Acer Nitro VG240Y 24\" FHD IPS 165Hz": 11999,
    "LG 24GN650 UltraGear 24\" FHD IPS 144Hz": 12999,
    "BenQ MOBIUZ EX2510S 25\" FHD IPS 165Hz": 14999,
    "Samsung Odyssey G3 27\" FHD VA 144Hz": 13999,
    "ASUS VG27AQ1A 27\" QHD IPS 170Hz": 22999,
    "LG 27GP850-B UltraGear 27\" QHD Nano IPS 165Hz": 24999,
    "Dell S2722DGM 27\" QHD VA 165Hz Curved": 19999,
    "Samsung Odyssey G5 27\" QHD VA 165Hz Curved": 21999,
    "BenQ MOBIUZ EX2710Q 27\" QHD IPS 165Hz": 26999,
    "LG 27GR95QE UltraGear 27\" QHD OLED 240Hz": 49999,
    "Samsung Odyssey G7 32\" QHD VA 240Hz Curved": 39999,
    "ASUS ROG Swift PG32UQ 32\" 4K IPS 144Hz": 59999,
  },

  keyboards: {
    "Logitech K120 Wired Keyboard": 449,
    "HP K300 Wired Keyboard": 549,
    "Dell KB216 Wired Keyboard": 599,
    "Logitech K380 Bluetooth": 2499,
    "Logitech MK470 Wireless Combo": 3199,
    "Corsair K55 RGB Gaming": 3499,
    "Razer Cynosa V2 Gaming": 3999,
    "Logitech G213 Prodigy": 4499,
    "Cosmic Byte CB-GK-18 Firefly Mechanical": 2999,
    "Redragon Kumara K552 Mechanical": 2799,
    "Corsair K68 RGB Mechanical": 6499,
    "Razer BlackWidow V3 Mechanical": 8999,
    "Logitech G512 Carbon Mechanical": 8499,
    "Logitech G915 TKL Wireless": 14999,
    "Corsair K100 RGB Mechanical": 21999,
  },

  mice: {
    "Zebronics Zeb-Transformer Mouse": 199,
    "HP X1000 Wired Mouse": 349,
    "Logitech M170 Wireless": 499,
    "Logitech M221 Silent": 799,
    "Logitech M331 Silent Plus": 999,
    "Logitech G102 Lightsync Gaming": 1199,
    "Razer Viper Mini Gaming": 2499,
    "Logitech G304 Lightspeed Wireless": 2999,
    "Logitech G502 HERO Gaming": 3999,
    "Razer DeathAdder V2 Gaming": 4499,
    "Logitech MX Master 3S": 8499,
    "Razer Viper Ultimate Wireless": 9499,
    "Logitech G Pro X Superlight": 11499,
    "Razer Basilisk V3 Pro": 14999,
  },

  cooling: {
    "Stock CPU Cooler (Included with Processor)": 0,
    "Deepcool GAMMAXX 200T Air Cooler": 799,
    "Deepcool GAMMAXX 400 V2 Air Cooler": 1199,
    "Cooler Master Hyper 212 EVO V2": 2499,
    "Deepcool AK400 Air Cooler": 2799,
    "be quiet! Pure Rock 2 Air Cooler": 4499,
    "Noctua NH-U12S Air Cooler": 7499,
    "Noctua NH-D15 Dual Tower Air Cooler": 9499,
    "be quiet! Dark Rock Pro 4 Air Cooler": 8499,
    "Cooler Master MasterLiquid ML240L V2 RGB AIO": 5999,
    "Deepcool LS520 240mm AIO Liquid Cooler": 5499,
    "Corsair iCUE H100i RGB ELITE 240mm AIO": 9999,
    "NZXT Kraken X63 280mm AIO Liquid Cooler": 11999,
    "Corsair iCUE H150i RGB ELITE 360mm AIO": 13999,
    "Arctic Liquid Freezer II 360mm AIO": 11499,
    "Corsair iCUE H170i ELITE LCD 420mm AIO": 24999,
  },
};

export function getPriceUpdateInfo() {
  return {
    lastUpdate: "April 24, 2026",
    source: "Amazon.in, Flipkart, MDComputers, PrimeABGB",
    totalComponents: Object.values(componentPrices).reduce((total, cat) => {
      if (typeof cat === 'object' && !Array.isArray(cat)) {
        const nested = Object.values(cat);
        if (nested.length > 0 && typeof nested[0] === 'object') {
          return total + nested.reduce((sum, tier) => sum + Object.keys(tier as object).length, 0);
        }
        return total + Object.keys(cat).length;
      }
      return total;
    }, 0),
    nextUpdate: "Prices update with each deployment",
    note: "Real Indian market prices from authorized retailers",
  };
}

export default componentPrices;
