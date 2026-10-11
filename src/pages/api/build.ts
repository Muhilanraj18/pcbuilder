import type { NextApiRequest, NextApiResponse } from 'next';
import type { PCBuild, APIBuildRequest, PCPart, BuyLinks } from '@/types';
import { getEligibleProducts } from '@/lib/catalog';

/**
 * API Route: /api/build
 *
 * Generates an optimal PC build recommendation sourced from the Postgres
 * Product table (via getEligibleProducts).  All pricing comes from the
 * database — which is kept fresh by the /api/cron/sync-prices cron job.
 *
 * Supersedes the old static-file approach that read componentPrices from
 * src/utils/marketPrices.ts.
 */

type ComponentTier = 'budget' | 'midRange' | 'highEnd' | 'enthusiast';

// ── Prisma Product shape (subset we use) ──────────────────────────────────────
interface DbProduct {
  id:              string;
  name:            string;
  category:        string;
  tier:            string | null;
  brand:           string;
  currentPrice:    number;
  specs:           Record<string, unknown>;
  imageUrl:        string;
  amazonUrl:       string | null;
  flipkartUrl:     string | null;
  mdcomputersUrl:  string | null;
  isVerified:      boolean;
  inStock:         boolean;
  lastPriceCheckAt: Date;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PCBuild | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { budget, withMonitor, useCase }: APIBuildRequest = req.body;

    if (!budget || budget < 20000 || budget > 1000000) {
      return res.status(400).json({ error: 'Invalid budget. Must be between ₹20,000 and ₹10,00,000' });
    }

    let pcBudget = budget;
    const parts: PCPart[] = [];
    const warnings: string[] = [];

    // Add monitor if requested
    if (withMonitor) {
      const monitorBudget = Math.round(budget * 0.25);
      const { part: monitor, warning } = await selectFromDB('Monitor', monitorBudget, undefined, useCase);
      if (warning) warnings.push(warning);
      parts.push(monitor);
      pcBudget = budget - monitor.price;
    }

    // Determine component tier based on budget
    const tier = determineTier(pcBudget);
    const needsGPU = useCase === 'gaming' || useCase === 'graphics';

    // Budget allocation percentages
    const allocation = getAllocation(needsGPU);

    // ── Select each component from the database ──────────────────────────────

    // 1. CPU
    const { part: cpu, warning: cpuWarn } = await selectFromDB(
      'Processor', Math.round(pcBudget * allocation.cpu), tier
    );
    if (cpuWarn) warnings.push(cpuWarn);
    parts.push(cpu);

    // 2. GPU (if needed)
    if (needsGPU) {
      const { part: gpu, warning: gpuWarn } = await selectFromDB(
        'Graphics Card', Math.round(pcBudget * allocation.gpu), tier
      );
      if (gpuWarn) warnings.push(gpuWarn);
      parts.push(gpu);
    }

    // 3. Motherboard — filtered to match CPU socket
    const { part: mobo, warning: moboWarn } = await selectMotherboard(
      Math.round(pcBudget * allocation.motherboard), tier, cpu
    );
    if (moboWarn) warnings.push(moboWarn);
    parts.push(mobo);

    // 4. RAM — prefer DDR5 for highEnd/enthusiast
    const ramTier = (tier === 'enthusiast' || tier === 'highEnd') ? 'ddr5' : 'ddr4';
    const { part: ram, warning: ramWarn } = await selectFromDB(
      'RAM', Math.round(pcBudget * allocation.ram), ramTier
    );
    if (ramWarn) warnings.push(ramWarn);
    parts.push(ram);

    // 5. Storage — prefer NVMe
    const { part: storage, warning: storageWarn } = await selectFromDB(
      'Storage', Math.round(pcBudget * allocation.storage), 'nvme'
    );
    if (storageWarn) warnings.push(storageWarn);
    parts.push(storage);

    // 6. PSU — sized by CPU+GPU TDP with 20% headroom
    const { part: psu, warning: psuWarn } = await selectPSU(
      Math.round(pcBudget * allocation.psu), cpu, needsGPU ? parts.find(p => p.category === 'Graphics Card') : undefined, tier
    );
    if (psuWarn) warnings.push(psuWarn);
    parts.push(psu);

    // 7. Cabinet
    const { part: cabinet, warning: cabWarn } = await selectFromDB(
      'Cabinet', Math.round(pcBudget * allocation.cabinet)
    );
    if (cabWarn) warnings.push(cabWarn);
    parts.push(cabinet);

    // 8. Keyboard
    const { part: keyboard, warning: kbWarn } = await selectFromDB(
      'Keyboard', Math.round(pcBudget * allocation.keyboard)
    );
    if (kbWarn) warnings.push(kbWarn);
    parts.push(keyboard);

    // 9. Mouse
    const { part: mouse, warning: mouseWarn } = await selectFromDB(
      'Mouse', Math.round(pcBudget * allocation.mouse)
    );
    if (mouseWarn) warnings.push(mouseWarn);
    parts.push(mouse);

    // 10. Cooling (skip for budget tier)
    if (tier !== 'budget') {
      const { part: cooling, warning: coolWarn } = await selectFromDB(
        'Cooling', Math.round(pcBudget * allocation.cooling)
      );
      if (coolWarn) warnings.push(coolWarn);
      parts.push(cooling);
    }

    // ── Build the response ───────────────────────────────────────────────────
    const totalPrice = parts.reduce((sum, part) => sum + part.price, 0);
    const savings = budget - totalPrice;

    const build: PCBuild = {
      id: `build-${Date.now()}`,
      budget,
      withMonitor,
      useCase,
      totalPrice,
      savings: savings > 0 ? savings : 0,
      parts,
      ...(warnings.length > 0 ? { warnings } : {}),
    };

    res.status(200).json(build);
  } catch (error) {
    console.error('Build recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate build recommendation' });
  }
}

// ── Tier determination ────────────────────────────────────────────────────────
function determineTier(budget: number): ComponentTier {
  if (budget >= 250000) return 'enthusiast';
  if (budget >= 100000) return 'highEnd';
  if (budget >= 50000)  return 'midRange';
  return 'budget';
}

// ── Budget allocation ─────────────────────────────────────────────────────────
function getAllocation(needsGPU: boolean) {
  if (needsGPU) {
    return {
      cpu: 0.20, gpu: 0.35, motherboard: 0.12, ram: 0.10,
      storage: 0.10, psu: 0.06, cabinet: 0.04, keyboard: 0.015,
      mouse: 0.01, cooling: 0.025,
    };
  }
  return {
    cpu: 0.40, gpu: 0, motherboard: 0.12, ram: 0.15,
    storage: 0.12, psu: 0.06, cabinet: 0.04, keyboard: 0.015,
    mouse: 0.01, cooling: 0.025,
  };
}

// ── Generic selector: query DB, pick best within budget ───────────────────────
interface SelectResult {
  part: PCPart;
  warning?: string;
}

async function selectFromDB(
  category: string,
  maxBudget: number,
  tier?: string,
  useCase?: string,
): Promise<SelectResult> {
  // Allow 15% over-budget to find best match (same tolerance as old code)
  const products = await getEligibleProducts(category, Math.round(maxBudget * 1.15), tier) as DbProduct[];

  if (products.length === 0 && tier) {
    // Try without tier restriction
    const fallback = await getEligibleProducts(category, Math.round(maxBudget * 1.15)) as DbProduct[];
    if (fallback.length > 0) {
      return { part: dbProductToPCPart(fallback[0], category), warning: undefined };
    }
    return {
      part: createFallbackPart(category, maxBudget),
      warning: `No ${category} products found in the database within ₹${maxBudget.toLocaleString('en-IN')}. Using a placeholder — please add products to the catalog.`,
    };
  }

  if (products.length === 0) {
    return {
      part: createFallbackPart(category, maxBudget),
      warning: `No ${category} products found in the database within ₹${maxBudget.toLocaleString('en-IN')}. Using a placeholder — please add products to the catalog.`,
    };
  }

  // products are ordered by price desc from getEligibleProducts — first is best-spec within budget
  return { part: dbProductToPCPart(products[0], category) };
}

// ── Motherboard selector: compatibility-aware ─────────────────────────────────
async function selectMotherboard(
  maxBudget: number,
  tier: ComponentTier,
  cpu: PCPart,
): Promise<SelectResult> {
  const isAMD = cpu.name.toLowerCase().includes('amd') || cpu.name.toLowerCase().includes('ryzen');

  // Query all motherboards within budget+tolerance
  const allMobos = await getEligibleProducts('Motherboard', Math.round(maxBudget * 1.15), tier) as DbProduct[];

  // Filter to socket-compatible boards
  const compatible = allMobos.filter(m => {
    const nameLower = m.name.toLowerCase();
    const specsSocket = typeof m.specs === 'object' && m.specs !== null
      ? String((m.specs as Record<string, unknown>).socket ?? '').toLowerCase()
      : '';

    if (isAMD) {
      return nameLower.includes('(amd)') || nameLower.includes('amd') ||
        nameLower.includes('am4') || nameLower.includes('am5') ||
        nameLower.includes('b550') || nameLower.includes('b650') ||
        nameLower.includes('x570') || nameLower.includes('x670') ||
        nameLower.includes('a520') || nameLower.includes('b450') ||
        specsSocket.includes('am4') || specsSocket.includes('am5');
    }
    return nameLower.includes('(intel)') || nameLower.includes('intel') ||
      nameLower.includes('lga') || nameLower.includes('h610') ||
      nameLower.includes('b660') || nameLower.includes('z690') ||
      nameLower.includes('z790') || nameLower.includes('h670') ||
      specsSocket.includes('lga');
  });

  if (compatible.length > 0) {
    return { part: dbProductToPCPart(compatible[0], 'Motherboard') };
  }

  // Fall back: try without tier
  const fallbackMobos = await getEligibleProducts('Motherboard', Math.round(maxBudget * 1.15)) as DbProduct[];
  const fallbackCompatible = fallbackMobos.filter(m => {
    const nameLower = m.name.toLowerCase();
    return isAMD
      ? (nameLower.includes('amd') || nameLower.includes('am4') || nameLower.includes('am5') || nameLower.includes('b550') || nameLower.includes('b650') || nameLower.includes('x570') || nameLower.includes('a520') || nameLower.includes('b450'))
      : (nameLower.includes('intel') || nameLower.includes('lga') || nameLower.includes('h610') || nameLower.includes('b660') || nameLower.includes('z690') || nameLower.includes('z790'));
  });

  if (fallbackCompatible.length > 0) {
    return { part: dbProductToPCPart(fallbackCompatible[0], 'Motherboard') };
  }

  // Last resort: take any motherboard
  if (fallbackMobos.length > 0) {
    return {
      part: dbProductToPCPart(fallbackMobos[0], 'Motherboard'),
      warning: `No motherboard matching your ${isAMD ? 'AMD' : 'Intel'} CPU found within budget. Selected best available — please verify socket compatibility.`,
    };
  }

  return {
    part: createFallbackPart('Motherboard', maxBudget),
    warning: `No Motherboard products found in the database within ₹${maxBudget.toLocaleString('en-IN')}.`,
  };
}

// ── PSU selector: wattage-aware (CPU+GPU TDP + 20% headroom) ──────────────────
async function selectPSU(
  maxBudget: number,
  cpu: PCPart,
  gpu: PCPart | undefined,
  tier: ComponentTier,
): Promise<SelectResult> {
  // Estimate TDP from component names/tier
  const cpuTDP = estimateCpuTDP(cpu.name, tier);
  const gpuTDP = gpu ? estimateGpuTDP(gpu.name, tier) : 0;
  const systemTDP = cpuTDP + gpuTDP + 100; // +100W for mobo, RAM, storage, fans
  const requiredWattage = Math.round(systemTDP * 1.2); // 20% headroom

  const allPSUs = await getEligibleProducts('Power Supply', Math.round(maxBudget * 1.2)) as DbProduct[];

  // Filter to PSUs with enough wattage
  const adequate = allPSUs.filter(p => {
    const wattMatch = p.name.match(/(\d+)\s*W/i);
    if (!wattMatch) return false;
    return parseInt(wattMatch[1]) >= requiredWattage;
  });

  if (adequate.length > 0) {
    // Sort by price ascending to get cheapest adequate PSU (value pick)
    adequate.sort((a, b) => a.currentPrice - b.currentPrice);
    return { part: dbProductToPCPart(adequate[0], 'Power Supply') };
  }

  // Fallback: take highest-wattage PSU available
  if (allPSUs.length > 0) {
    const byWattage = allPSUs.sort((a, b) => {
      const wA = parseInt(a.name.match(/(\d+)\s*W/i)?.[1] ?? '0');
      const wB = parseInt(b.name.match(/(\d+)\s*W/i)?.[1] ?? '0');
      return wB - wA;
    });
    return {
      part: dbProductToPCPart(byWattage[0], 'Power Supply'),
      warning: `Recommended PSU wattage is ${requiredWattage}W but no adequate PSU was found within budget. Selected highest available — consider increasing PSU budget.`,
    };
  }

  return {
    part: createFallbackPart('Power Supply', maxBudget),
    warning: `No Power Supply products found in the database within ₹${maxBudget.toLocaleString('en-IN')}.`,
  };
}

// ── TDP estimation helpers ────────────────────────────────────────────────────
function estimateCpuTDP(name: string, tier: ComponentTier): number {
  const n = name.toLowerCase();
  if (n.includes('i9') || n.includes('9 7950') || n.includes('9 5950') || n.includes('9 5900')) return 170;
  if (n.includes('i7') || n.includes('7 7700') || n.includes('7 5800') || n.includes('7 5700')) return 125;
  if (n.includes('i5-13600k') || n.includes('i5-13600kf')) return 125;
  if (n.includes('i5') || n.includes('5 7600') || n.includes('5 5600') || n.includes('5 5500') || n.includes('5 4500')) return 65;
  if (n.includes('i3') || n.includes('3 4100') || n.includes('3 3300')) return 58;
  return tier === 'enthusiast' ? 170 : tier === 'highEnd' ? 125 : 65;
}

function estimateGpuTDP(name: string, tier: ComponentTier): number {
  const n = name.toLowerCase();
  if (n.includes('4090')) return 450;
  if (n.includes('4080')) return 320;
  if (n.includes('7900 xtx')) return 355;
  if (n.includes('7900 xt')) return 315;
  if (n.includes('4070 ti')) return 285;
  if (n.includes('4070 super')) return 220;
  if (n.includes('4070')) return 200;
  if (n.includes('7800 xt')) return 263;
  if (n.includes('4060')) return 115;
  if (n.includes('7600')) return 165;
  if (n.includes('3060')) return 170;
  if (n.includes('3050') || n.includes('6600')) return 130;
  if (n.includes('6500')) return 107;
  if (n.includes('1650')) return 75;
  if (n.includes('1030')) return 30;
  return tier === 'enthusiast' ? 350 : tier === 'highEnd' ? 250 : 150;
}

// ── DB Product → PCPart converter ─────────────────────────────────────────────
function dbProductToPCPart(product: DbProduct, category: string): PCPart {
  const buyLinks: BuyLinks = {};
  if (product.amazonUrl)     buyLinks.amazon = product.amazonUrl;
  if (product.flipkartUrl)   buyLinks.flipkart = product.flipkartUrl;
  if (product.mdcomputersUrl) buyLinks.mdcomputers = product.mdcomputersUrl;

  // If no buy links at all, generate search URLs as fallback
  if (!buyLinks.amazon && !buyLinks.flipkart && !buyLinks.mdcomputers) {
    const q = encodeURIComponent(product.name);
    buyLinks.amazon     = `https://www.amazon.in/s?k=${q}`;
    buyLinks.flipkart   = `https://www.flipkart.com/search?q=${q}`;
    buyLinks.mdcomputers = `https://www.mdcomputers.in/index.php?search=${q}`;
  }

  const specs = buildSpecs(product, category);

  return {
    id: product.id,
    name: product.name,
    category: category as PCPart['category'],
    price: product.currentPrice,
    specs,
    compatibility: inferCompatibility(product, category),
    isEssential: !['Cooler', 'Keyboard', 'Mouse'].includes(category),
    whyRecommended: generateRecommendation(product, category),
    easyExplanation: EASY_EXPLANATIONS[category] ?? 'A component in your PC build.',
    buyLinks,
    imageUrl: product.imageUrl || undefined,
    brand: product.brand,
  };
}

// ── Specs builder (parses name + specs JSON for display) ──────────────────────
function buildSpecs(product: DbProduct, category: string): Record<string, string> {
  const name = product.name;
  const stored = (product.specs && typeof product.specs === 'object') ? product.specs as Record<string, unknown> : {};

  switch (category) {
    case 'Processor': {
      const coreMatch = name.match(/(\d+)\s*core/i);
      const cores = String(stored.cores ?? coreMatch?.[1] ?? '6');
      return {
        cores,
        threads: String(stored.threads ?? String(parseInt(cores) * 2)),
        brand: name.includes('AMD') ? 'AMD' : 'Intel',
      };
    }
    case 'Graphics Card': {
      const vramMatch = name.match(/(\d+)\s*GB/i);
      return {
        vram: vramMatch ? `${vramMatch[1]}GB` : '4GB',
        type: name.includes('AMD') || name.includes('Radeon') ? 'AMD' : 'NVIDIA',
      };
    }
    case 'Motherboard': {
      const isAMD = name.toLowerCase().includes('amd') || name.toLowerCase().includes('am4') || name.toLowerCase().includes('am5');
      return {
        socket: String(stored.socket ?? (isAMD ? 'AM4/AM5' : 'LGA')),
        formFactor: String(stored.formFactor ?? 'Micro ATX'),
        chipset: String(stored.chipset ?? name.split(' ')[0]),
      };
    }
    case 'RAM': {
      const capMatch = name.match(/(\d+)\s*GB/i);
      const type = name.includes('DDR5') ? 'DDR5' : 'DDR4';
      return {
        capacity: capMatch ? `${capMatch[1]}GB` : '8GB',
        type,
        speed: type === 'DDR5' ? '5600MHz' : '3200MHz',
      };
    }
    case 'Storage': {
      const capMatch = name.match(/(\d+)\s*(?:GB|TB)/i);
      const isNVMe = name.includes('NVMe');
      return {
        capacity: capMatch ? capMatch[0] : '512GB',
        type: isNVMe ? 'NVMe SSD' : name.includes('HDD') ? 'HDD' : 'SATA SSD',
        speed: isNVMe ? '3500 MB/s' : '550 MB/s',
      };
    }
    case 'Power Supply': {
      const wattMatch = name.match(/(\d+)\s*W/i);
      return {
        wattage: wattMatch ? `${wattMatch[1]}W` : '550W',
        efficiency: name.includes('Gold') ? '80+ Gold' : name.includes('Platinum') ? '80+ Platinum' : '80+ Bronze',
      };
    }
    case 'Monitor': {
      const sizeMatch = name.match(/(\d+)"/);
      const resMatch = name.match(/(\d+x\d+)/);
      const refreshMatch = name.match(/(\d+)Hz/);
      return {
        size: sizeMatch ? sizeMatch[0] : 'N/A',
        resolution: resMatch ? resMatch[1] : '1920x1080',
        refresh: refreshMatch ? refreshMatch[0] : '60Hz',
      };
    }
    case 'Keyboard': {
      const isMech = name.toLowerCase().includes('mechanical');
      return {
        type: isMech ? 'Mechanical' : 'Membrane',
        connectivity: name.toLowerCase().includes('wireless') ? 'Wireless' : 'Wired',
      };
    }
    case 'Mouse': {
      const isGaming = name.toLowerCase().includes('gaming') || name.toLowerCase().includes('g502') || name.toLowerCase().includes('deathadder');
      return {
        type: isGaming ? 'Gaming' : 'Standard',
        connectivity: name.toLowerCase().includes('wireless') ? 'Wireless' : 'Wired',
      };
    }
    case 'Cooling': {
      const isLiquid = name.toLowerCase().includes('liquid') || name.toLowerCase().includes('aio') || name.toLowerCase().includes('h100') || name.toLowerCase().includes('h150');
      return {
        type: isLiquid ? 'Liquid AIO' : 'Air Tower',
        fans: isLiquid ? '2-3' : '1-2',
      };
    }
    case 'Cabinet':
      return { type: String(stored.type ?? 'Mid Tower') };
    default:
      return {};
  }
}

// ── Compatibility inference ───────────────────────────────────────────────────
function inferCompatibility(product: DbProduct, category: string): string[] {
  const name = product.name.toLowerCase();
  switch (category) {
    case 'Processor':
      return [name.includes('amd') || name.includes('ryzen') ? 'AM4/AM5 Socket' : 'LGA Socket', 'DDR4/DDR5'];
    case 'Graphics Card':
      return ['PCIe x16'];
    case 'Motherboard':
      return [
        (name.includes('amd') || name.includes('am4') || name.includes('am5')) ? 'AMD Processors' : 'Intel Processors',
        'DDR4/DDR5',
      ];
    case 'RAM':
      return [name.includes('ddr5') ? 'DDR5 Motherboards' : 'DDR4 Motherboards'];
    case 'Storage':
      return [name.includes('nvme') || name.includes('m.2') ? 'M.2 Slot' : 'SATA Port'];
    case 'Power Supply':
      return ['Standard ATX'];
    case 'Cabinet':
      return ['Micro ATX', 'ATX'];
    case 'Monitor':
      return ['HDMI', 'DisplayPort'];
    default:
      return ['USB'];
  }
}

// ── Recommendation text generator ─────────────────────────────────────────────
function generateRecommendation(product: DbProduct, category: string): string {
  const name = product.name;
  switch (category) {
    case 'Processor': {
      const coreMatch = name.match(/(\d+)\s*core/i);
      return `${coreMatch ? coreMatch[1] + '-core p' : 'P'}rocessor with excellent performance for your budget tier.`;
    }
    case 'Graphics Card': {
      const vramMatch = name.match(/(\d+)\s*GB/i);
      return `${vramMatch ? vramMatch[1] + 'GB' : 'Dedicated'} VRAM provides smooth gaming performance. Excellent for modern games.`;
    }
    case 'Motherboard':
      return 'Quality motherboard with all necessary features and upgrade potential.';
    case 'RAM': {
      const capMatch = name.match(/(\d+)\s*GB/i);
      return `${capMatch ? capMatch[1] + 'GB' : 'Adequate'} provides smooth multitasking without slowdowns.`;
    }
    case 'Storage': {
      const isNVMe = name.includes('NVMe');
      return `Fast ${isNVMe ? 'NVMe' : 'SSD'} storage for quick boot and program loading.`;
    }
    case 'Power Supply': {
      const wMatch = name.match(/(\d+)\s*W/i);
      return `${wMatch ? wMatch[1] + 'W' : 'Adequate'} provides stable power with headroom for your components.`;
    }
    case 'Monitor': {
      const refreshMatch = name.match(/(\d+)Hz/);
      const hz = refreshMatch ? parseInt(refreshMatch[1]) : 60;
      if (hz >= 144) return `${hz}Hz high refresh rate for ultra-smooth visuals and competitive gaming.`;
      if (hz >= 100) return `${hz}Hz refresh rate for smooth gaming and daily use.`;
      return 'Good display quality for productivity and entertainment.';
    }
    case 'Keyboard':
      return name.toLowerCase().includes('mechanical')
        ? 'Mechanical switches for better typing feel and durability.'
        : 'Reliable keyboard for daily use.';
    case 'Mouse':
      return (name.toLowerCase().includes('gaming') || name.toLowerCase().includes('g502'))
        ? 'High-precision gaming mouse with programmable buttons.'
        : 'Reliable mouse for daily use.';
    case 'Cooling': {
      const isLiquid = name.toLowerCase().includes('liquid') || name.toLowerCase().includes('aio');
      return isLiquid
        ? 'Liquid cooling provides excellent thermal performance for overclocking.'
        : 'High-performance air cooling with quiet operation.';
    }
    case 'Cabinet':
      return 'Quality case with good airflow and cable management.';
    default:
      return 'Selected component for your build.';
  }
}

// ── Easy explanations (beginner-friendly text) ────────────────────────────────
const EASY_EXPLANATIONS: Record<string, string> = {
  'Processor':    'The brain of your PC that handles all processing tasks.',
  'Graphics Card': 'Makes games look beautiful and run smoothly.',
  'Motherboard':  'Connects all components together like a nervous system.',
  'RAM':          'Temporary memory for running programs — more is better.',
  'Storage':      'Stores all your files permanently. Very fast compared to old hard drives.',
  'Power Supply': 'Provides reliable electricity to all components.',
  'Cabinet':      'The case that protects and cools your components.',
  'Monitor':      'Your display screen with the right size and quality for your needs.',
  'Keyboard':     'Your input device for typing and shortcuts.',
  'Mouse':        'Your pointing and clicking device.',
  'Cooling':      'Keeps your CPU cool for better performance and longevity.',
};

// ── Fallback part (when DB is empty for a category) ───────────────────────────
function createFallbackPart(category: string, budget: number): PCPart {
  return {
    id: `fallback-${category.toLowerCase().replace(/\s/g, '-')}`,
    name: `[No ${category} in catalog]`,
    category: category as PCPart['category'],
    price: 0,
    specs: {},
    compatibility: [],
    isEssential: true,
    whyRecommended: `No ${category} products are currently in the database. Please add products to the catalog.`,
    easyExplanation: EASY_EXPLANATIONS[category] ?? '',
  };
}
