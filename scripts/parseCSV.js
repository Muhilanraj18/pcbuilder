const fs = require('fs');
const path = require('path');

// Read CSV file
const csvContent = fs.readFileSync('computer_prices_all.csv', 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

console.log('🔍 Parsing 100,000 rows of component data...\n');

// Indian market price conversion (CSV is in USD, convert to INR and adjust for actual retail)
const USD_TO_INR = 83;
const RETAIL_MARKUP = 1.18; // 18% GST + retail margin

// Data structures to collect unique components
const components = {
  processors: { budget: new Map(), midRange: new Map(), highEnd: new Map(), enthusiast: new Map() },
  graphicsCards: { budget: new Map(), midRange: new Map(), highEnd: new Map(), enthusiast: new Map() },
  ram: { ddr4: new Map(), ddr5: new Map() },
  storage: { ssd: new Map(), nvme: new Map(), hdd: new Map() },
  powerSupplies: new Map(),
  monitors: new Map(),
};

// Parse each line (skip header)
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  
  const cols = lines[i].split(',');
  if (cols.length < 33) continue;

  const deviceType = cols[0];
  const brand = cols[1];
  const model = cols[2];
  const cpuBrand = cols[6];
  const cpuModel = cols[7];
  const cpuTier = parseInt(cols[8]) || 0;
  const cpuCores = parseInt(cols[9]) || 0;
  const cpuThreads = parseInt(cols[10]) || 0;
  const gpuBrand = cols[13];
  const gpuModel = cols[14];
  const gpuTier = parseInt(cols[15]) || 0;
  const vramGB = parseInt(cols[16]) || 0;
  const ramGB = parseInt(cols[17]) || 0;
  const storageType = cols[18];
  const storageGB = parseInt(cols[19]) || 0;
  const psuWatts = parseInt(cols[26]) || 0;
  const price = parseFloat(cols[32]) || 0;

  // Only process Desktop items for components
  if (deviceType === 'Desktop') {
    const inrPrice = price * USD_TO_INR * RETAIL_MARKUP;
    
    // Extract CPU components
    if (cpuBrand !== 'Apple' && cpuModel && price > 0) {
      const cpuKey = `${cpuBrand} ${cpuModel}`;
      const tier = cpuTier <= 2 ? 'budget' : cpuTier <= 3 ? 'midRange' : cpuTier <= 4 ? 'highEnd' : 'enthusiast';
      const cpuPrice = Math.round(inrPrice * 0.18); // CPU is ~18% of desktop price
      
      if (!components.processors[tier].has(cpuKey)) {
        components.processors[tier].set(cpuKey, cpuPrice);
      } else {
        const existing = components.processors[tier].get(cpuKey);
        components.processors[tier].set(cpuKey, Math.min(existing, cpuPrice));
      }
    }

    // Extract GPU components
    if (gpuBrand !== 'Apple' && gpuBrand !== 'Intel' && gpuModel && vramGB >= 4 && price > 0) {
      const cleanGpuModel = gpuModel.replace(/\s*Ti\s*/, ' Ti').trim();
      const gpuKey = `${gpuBrand} ${cleanGpuModel} ${vramGB}GB (${brand})`;
      const tier = gpuTier <= 1 ? 'budget' : gpuTier <= 3 ? 'midRange' : gpuTier <= 5 ? 'highEnd' : 'enthusiast';
      const gpuPrice = Math.round(inrPrice * 0.35); // GPU is ~35% of desktop price
      
      if (!components.graphicsCards[tier].has(gpuKey)) {
        components.graphicsCards[tier].set(gpuKey, gpuPrice);
      } else {
        const existing = components.graphicsCards[tier].get(gpuKey);
        components.graphicsCards[tier].set(gpuKey, Math.min(existing, gpuPrice));
      }
    }

    // Extract RAM
    if (ramGB >= 8 && ramGB <= 128) {
      const ramKey = `${ramGB}GB DDR${ramGB >= 32 ? '5' : '4'} RAM`;
      const ramType = ramGB >= 32 ? 'ddr5' : 'ddr4';
      const pricePerGB = ramGB >= 32 ? 400 : 350; // DDR5 more expensive
      const ramPrice = Math.round(ramGB * pricePerGB);
      
      if (!components.ram[ramType].has(ramKey)) {
        components.ram[ramType].set(ramKey, ramPrice);
      }
    }

    // Extract Storage
    if (storageGB >= 256 && storageGB <= 4096) {
      const storageKey = `${storageGB}GB ${storageType}`;
      const pricePerGB = storageType === 'NVMe' ? 80 : storageType === 'SSD' ? 60 : 20;
      const storagePrice = Math.round(storageGB * pricePerGB / 10);
      
      const storageCategory = storageType === 'NVMe' ? 'nvme' : 
                             storageType === 'SSD' ? 'ssd' : 'hdd';
      
      if (!components.storage[storageCategory].has(storageKey)) {
        components.storage[storageCategory].set(storageKey, storagePrice);
      }
    }

    // Extract PSU based on system power
    if (psuWatts >= 300 && psuWatts <= 1600) {
      const psuKey = `${psuWatts}W Power Supply`;
      const psuPrice = Math.round(psuWatts * 75 / 10); // ~₹7.5 per watt
      
      if (!components.powerSupplies.has(psuKey)) {
        components.powerSupplies.set(psuKey, psuPrice);
      }
    }
  }

  // Process Laptop items for monitor reference
  if (deviceType === 'Laptop') {
    const displaySize = parseFloat(cols[22]) || 0;
    const resolution = cols[23];
    const refreshHz = parseInt(cols[24]) || 60;
    
    if (displaySize >= 21 && displaySize <= 34 && resolution) {
      const monitorKey = `${Math.round(displaySize)}" ${resolution} ${refreshHz}Hz`;
      const basePrice = displaySize * 450;
      const refreshBonus = refreshHz > 60 ? (refreshHz - 60) * 35 : 0;
      const resBonus = resolution.includes('3840') ? 15000 : resolution.includes('2560') ? 5000 : 0;
      const monitorPrice = Math.round(basePrice + refreshBonus + resBonus);
      
      if (!components.monitors.has(monitorKey)) {
        components.monitors.set(monitorKey, monitorPrice);
      }
    }
  }
}

// Add Indian market components based on actual prices
const indianComponents = {
  keyboards: [
    ['Logitech K120 Wired Keyboard', 450],
    ['HP K300 Wired Keyboard', 550],
    ['Dell KB216 Wired Keyboard', 600],
    ['Logitech K380 Bluetooth', 2500],
    ['Logitech MK470 Wireless Combo', 3200],
    ['Corsair K55 RGB Gaming', 3500],
    ['Razer Cynosa V2 Gaming', 4000],
    ['Logitech G213 Prodigy', 4500],
    ['Corsair K68 RGB Mechanical', 6500],
    ['Razer BlackWidow V3 Mechanical', 9000],
    ['Logitech G512 Carbon Mechanical', 8500],
    ['Logitech G915 TKL Wireless', 15000],
    ['Corsair K100 RGB Mechanical', 22000],
  ],
  
  mice: [
    ['Zebronics Zeb-Transformer Mouse', 200],
    ['HP X1000 Wired Mouse', 350],
    ['Logitech M170 Wireless', 500],
    ['Logitech M221 Silent', 800],
    ['Logitech M331 Silent Plus', 1000],
    ['Logitech G102 Gaming', 1200],
    ['Razer Viper Mini Gaming', 2500],
    ['Logitech G304 Wireless', 3000],
    ['Logitech G502 HERO Gaming', 4000],
    ['Razer DeathAdder V2 Gaming', 4500],
    ['Logitech MX Master 3', 8500],
    ['Razer Viper Ultimate Wireless', 9500],
    ['Logitech G Pro X Superlight', 11500],
    ['Razer Basilisk V3 Pro', 15000],
  ],
  
  cooling: [
    ['Stock CPU Cooler', 0],
    ['Deepcool GAMMAXX 200T', 800],
    ['Deepcool GAMMAXX 400', 1200],
    ['Cooler Master Hyper 212', 2500],
    ['Deepcool AK400', 2800],
    ['be quiet! Pure Rock 2', 4500],
    ['Noctua NH-U12S', 7500],
    ['Noctua NH-D15', 9500],
    ['be quiet! Dark Rock Pro 4', 8500],
    ['Cooler Master MasterLiquid ML240L', 6500],
    ['Corsair H100i RGB Platinum', 10500],
    ['NZXT Kraken X63 280mm', 12000],
    ['Corsair H150i Elite Capellix', 18000],
    ['Arctic Liquid Freezer II 360', 14000],
    ['Corsair H170i Elite LCD 420mm', 25000],
  ],
  
  cabinets: [
    ['Ant Esports ICE-120AG', 2500],
    ['Deepcool MATREXX 30', 2800],
    ['Cooler Master MasterBox Q300L', 3500],
    ['Corsair Carbide 175R RGB', 4500],
    ['Antec NX410', 4800],
    ['NZXT H510', 6500],
    ['Lian Li Lancool 215', 7500],
    ['Fractal Design Meshify C', 8500],
    ['Corsair 4000D Airflow', 9000],
    ['be quiet! Pure Base 500DX', 10500],
    ['Phanteks Eclipse P400A', 8000],
    ['Lian Li O11 Dynamic', 13000],
    ['Corsair 5000D Airflow', 14500],
    ['Fractal Design Torrent', 18000],
    ['Lian Li O11 Dynamic EVO', 19500],
  ],
  
  motherboards: {
    budget: [
      ['MSI H510M-A PRO (Intel)', 6500],
      ['ASRock H610M-HDV (Intel)', 7000],
      ['Gigabyte H510M H (Intel)', 6800],
      ['ASUS Prime H610M-E (Intel)', 7200],
      ['MSI A320M-A PRO (AMD)', 5500],
      ['Gigabyte A520M DS3H (AMD)', 6000],
      ['ASRock B450M-HDV (AMD)', 6500],
    ],
    midRange: [
      ['MSI B660M PRO-VDH (Intel)', 12500],
      ['ASUS TUF B660M-PLUS (Intel)', 13500],
      ['Gigabyte B660M DS3H (Intel)', 12000],
      ['ASRock B660M Steel Legend (Intel)', 14000],
      ['MSI B550M PRO-VDH (AMD)', 10500],
      ['ASUS TUF B550M-PLUS (AMD)', 12000],
      ['Gigabyte B550M AORUS ELITE (AMD)', 13000],
    ],
    highEnd: [
      ['ASUS ROG STRIX Z690-F (Intel)', 28000],
      ['MSI Z690 TOMAHAWK (Intel)', 26000],
      ['Gigabyte Z690 AORUS ELITE (Intel)', 27000],
      ['ASRock Z690 Steel Legend (Intel)', 24000],
      ['ASUS ROG STRIX B550-F (AMD)', 18000],
      ['MSI X570 TOMAHAWK (AMD)', 22000],
      ['Gigabyte X570 AORUS ELITE (AMD)', 21000],
    ],
    enthusiast: [
      ['ASUS ROG MAXIMUS Z790 HERO (Intel)', 58000],
      ['MSI MEG Z790 ACE (Intel)', 65000],
      ['Gigabyte Z790 AORUS MASTER (Intel)', 62000],
      ['ASUS ROG CROSSHAIR X670E HERO (AMD)', 68000],
      ['MSI MEG X670E ACE (AMD)', 72000],
      ['Gigabyte X670E AORUS MASTER (AMD)', 70000],
    ]
  }
};

// Generate TypeScript code
function generateComponentObject(map, indent = 2, limit = 30) {
  const spaces = ' '.repeat(indent);
  let code = '{\n';
  
  const entries = Array.from(map.entries())
    .sort((a, b) => a[1] - b[1]) // Sort by price
    .filter(([name, price]) => price >= 500 && price <= 500000) // Reasonable price range
    .slice(0, limit);
  
  entries.forEach(([name, price]) => {
    const safeName = name.replace(/"/g, '\\"');
    code += `${spaces}  "${safeName}": ${price},\n`;
  });
  
  code += `${spaces}}`;
  return code;
}

function generateSimpleObject(arr, indent = 2) {
  const spaces = ' '.repeat(indent);
  let code = '{\n';
  
  arr.forEach(([name, price]) => {
    const safeName = name.replace(/"/g, '\\"');
    code += `${spaces}  "${safeName}": ${price},\n`;
  });
  
  code += `${spaces}}`;
  return code;
}

function generateTieredObject(obj, indent = 2, limit = 30) {
  const spaces = ' '.repeat(indent);
  let code = '{\n';
  
  Object.keys(obj).forEach(tier => {
    if (obj[tier] instanceof Map) {
      code += `${spaces}  ${tier}: ${generateComponentObject(obj[tier], indent + 2, limit)},\n`;
    }
  });
  
  code += `${spaces}}`;
  return code;
}

// Generate the complete marketPrices.ts content
const tsContent = `// Auto-generated from computer_prices_all.csv
// Last Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
// Data source: 100,000 rows of component data
// Prices in Indian Rupees (₹)

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
  processors: ${generateTieredObject(components.processors, 2, 40)},

  graphicsCards: ${generateTieredObject(components.graphicsCards, 2, 50)},

  motherboards: {
    budget: ${generateSimpleObject(indianComponents.motherboards.budget)},
    midRange: ${generateSimpleObject(indianComponents.motherboards.midRange)},
    highEnd: ${generateSimpleObject(indianComponents.motherboards.highEnd)},
    enthusiast: ${generateSimpleObject(indianComponents.motherboards.enthusiast)},
  },

  ram: {
    ddr4: ${generateComponentObject(components.ram.ddr4, 4, 15)},
    ddr5: ${generateComponentObject(components.ram.ddr5, 4, 15)},
  },

  storage: {
    ssd: ${generateComponentObject(components.storage.ssd, 4, 20)},
    nvme: ${generateComponentObject(components.storage.nvme, 4, 20)},
    hdd: ${generateComponentObject(components.storage.hdd, 4, 10)},
  },

  powerSupplies: ${generateComponentObject(components.powerSupplies, 2, 25)},

  cabinets: ${generateSimpleObject(indianComponents.cabinets)},

  monitors: ${generateComponentObject(components.monitors, 2, 40)},

  keyboards: ${generateSimpleObject(indianComponents.keyboards)},

  mice: ${generateSimpleObject(indianComponents.mice)},

  cooling: ${generateSimpleObject(indianComponents.cooling)},
};

export default componentPrices;
`;

// Write to file
const outputPath = path.join(__dirname, '..', 'src', 'utils', 'marketPrices.generated.ts');
fs.writeFileSync(outputPath, tsContent);

console.log('✅ Generated marketPrices.generated.ts');
console.log(`\n📊 Component Statistics:`);
console.log(`   Processors: ${components.processors.budget.size + components.processors.midRange.size + components.processors.highEnd.size + components.processors.enthusiast.size} unique CPUs`);
console.log(`   Graphics Cards: ${components.graphicsCards.budget.size + components.graphicsCards.midRange.size + components.graphicsCards.highEnd.size + components.graphicsCards.enthusiast.size} unique GPUs`);
console.log(`   RAM Options: ${components.ram.ddr4.size + components.ram.ddr5.size}`);
console.log(`   Storage Options: ${components.storage.ssd.size + components.storage.nvme.size + components.storage.hdd.size}`);
console.log(`   Power Supplies: ${components.powerSupplies.size}`);
console.log(`   Monitors: ${components.monitors.size}`);
console.log(`   Motherboards: ${indianComponents.motherboards.budget.length + indianComponents.motherboards.midRange.length + indianComponents.motherboards.highEnd.length + indianComponents.motherboards.enthusiast.length}`);
console.log(`   Keyboards: ${indianComponents.keyboards.length}`);
console.log(`   Mice: ${indianComponents.mice.length}`);
console.log(`   Cooling: ${indianComponents.cooling.length}`);
console.log(`   Cabinets: ${indianComponents.cabinets.length}`);
console.log('\n💰 Price ranges converted to INR with 18% GST included');
console.log('🎉 Done! Replace src/utils/marketPrices.ts with the generated file.');
console.log('\n📝 Next steps:');
console.log('   1. Review src/utils/marketPrices.generated.ts');
console.log('   2. If satisfied, run: Copy-Item src\\utils\\marketPrices.generated.ts src\\utils\\marketPrices.ts');
console.log('   3. Restart dev server to see new components');

