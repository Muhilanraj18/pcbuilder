import type { NextApiRequest, NextApiResponse } from 'next';
import type { PCPart, Shop, ComponentCategory } from '@/types';
import { componentPrices } from '@/utils/marketPrices';

/**
 * API Route: /api/parts/[id]
 *
 * Returns part details plus alternatives and partner shops
 */

interface PartDetailsResponse {
  part: PCPart;
  alternatives: PCPart[];
  shops: Shop[];
}

const SHOP_CATALOG: Shop[] = [
  {
    id: 'mdcomputers',
    name: 'MD Computers',
    rating: 4.5,
    location: 'Kolkata',
    branches: [{ area: 'Chandni Chowk', address: '71, Bentinck St, Kolkata, West Bengal 700001', distance: 2.3 }],
    onlineStore: 'https://mdcomputers.in',
    phone: '+91-33-4016-0400',
  },
  {
    id: 'primeabgb',
    name: 'PrimeABGB',
    rating: 4.7,
    location: 'Mumbai',
    branches: [{ area: 'Lamington Road', address: '1st Floor, 39, Lamington Rd, Mumbai, Maharashtra 400004', distance: 1.8 }],
    onlineStore: 'https://primeabgb.com',
    phone: '+91-22-6747-9222',
  },
  {
    id: 'vedant',
    name: 'Vedant Computers',
    rating: 4.4,
    location: 'Kolkata',
    branches: [{ area: 'Chandni Chowk', address: '18, Ezra St, Kolkata, West Bengal 700001', distance: 2.8 }],
    onlineStore: 'https://www.vedantcomputers.com',
  },
];

function mapIdToCategory(id: string): ComponentCategory {
  if (id.startsWith('cpu')) return 'Processor';
  if (id.startsWith('gpu')) return 'Graphics Card';
  if (id.startsWith('mobo')) return 'Motherboard';
  if (id.startsWith('ram')) return 'RAM';
  if (id.startsWith('storage')) return 'Storage';
  if (id.startsWith('psu')) return 'Power Supply';
  if (id.startsWith('cabinet')) return 'Cabinet';
  if (id.startsWith('monitor')) return 'Monitor';
  if (id.startsWith('cooling')) return 'Cooler';
  if (id.startsWith('keyboard')) return 'Keyboard';
  if (id.startsWith('mouse')) return 'Mouse';
  return 'Processor';
}

function getCategoryPool(category: ComponentCategory): Array<[string, number]> {
  switch (category) {
    case 'Processor':
      return Object.entries(componentPrices.processors.midRange);
    case 'Graphics Card':
      return Object.entries(componentPrices.graphicsCards.midRange);
    case 'Motherboard':
      return Object.entries(componentPrices.motherboards.midRange);
    case 'RAM':
      return Object.entries(componentPrices.ram.ddr4);
    case 'Storage':
      return Object.entries(componentPrices.storage.nvme);
    case 'Power Supply':
      return Object.entries(componentPrices.powerSupplies);
    case 'Cabinet':
      return Object.entries(componentPrices.cabinets);
    case 'Monitor':
      return Object.entries(componentPrices.monitors);
    case 'Cooler':
      return Object.entries(componentPrices.cooling);
    case 'Keyboard':
      return Object.entries(componentPrices.keyboards);
    case 'Mouse':
      return Object.entries(componentPrices.mice);
    default:
      return [];
  }
}

function buildSpecs(category: ComponentCategory, name: string): Record<string, string> {
  if (category === 'Processor') {
    return { brand: name.includes('AMD') ? 'AMD' : 'Intel', class: 'Desktop CPU' };
  }
  if (category === 'Graphics Card') {
    return { memory: /(\d+GB)/.exec(name)?.[1] || '8GB', class: 'Discrete GPU' };
  }
  if (category === 'RAM') {
    return { capacity: /(\d+GB)/.exec(name)?.[1] || '16GB', type: name.includes('DDR5') ? 'DDR5' : 'DDR4' };
  }
  if (category === 'Storage') {
    return { type: name.includes('NVMe') ? 'NVMe SSD' : 'SSD', capacity: /(\d+GB|\d+TB)/.exec(name)?.[1] || '1TB' };
  }
  return { category };
}

function createPart(id: string, name: string, category: ComponentCategory, price: number): PCPart {
  return {
    id,
    name,
    category,
    price,
    specs: buildSpecs(category, name),
    compatibility: ['Verified in build planner'],
    whyRecommended: 'Selected from current component database based on value and compatibility.',
    easyExplanation: `This ${category.toLowerCase()} is selected to balance performance and budget.`,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PartDetailsResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const nameQuery = typeof req.query.name === 'string' ? req.query.name : '';
  const categoryQuery = typeof req.query.category === 'string' ? (req.query.category as ComponentCategory) : null;

  try {
    const safeId = typeof id === 'string' ? id : 'part-unknown';
    const category = categoryQuery || mapIdToCategory(safeId);
    const pool = getCategoryPool(category);
    const fallback = pool[0] || ['Component', 0];

    const exact = nameQuery ? pool.find(([n]) => n.toLowerCase() === nameQuery.toLowerCase()) : undefined;
    const selectedName = exact?.[0] || nameQuery || fallback[0];
    const selectedPrice = exact?.[1] || fallback[1];

    const part = createPart(safeId, selectedName, category, selectedPrice);

    const alternatives = pool
      .filter(([n]) => n !== selectedName)
      .slice(0, 4)
      .map(([name, price], idx) => createPart(`${safeId}-alt-${idx + 1}`, name, category, price));

    res.status(200).json({
      part,
      alternatives,
      shops: SHOP_CATALOG,
    });
  } catch (error) {
    console.error('Error fetching part:', error);
    res.status(500).json({ error: 'Failed to fetch part details' });
  }
}
