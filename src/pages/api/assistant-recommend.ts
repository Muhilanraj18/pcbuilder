import type { NextApiRequest, NextApiResponse } from "next";

type UseCase = "gaming" | "coding" | "editing" | "general";
type ComponentType = "cpu" | "gpu" | "motherboard" | "ram" | "ssd" | "psu";

type Candidate = {
  id: string;
  type: ComponentType;
  name: string;
  brand: string;
  performance: number; // 0-100
  reliability: number; // 0-100
  socket?: string;
  ramType?: "DDR4" | "DDR5";
  ramGB?: number;
  vramGB?: number;
  tdp?: number;
  wattage?: number;
};

type StoreQuote = {
  platform: string;
  price: number;
  url: string;
  trust: number;
  inStock: boolean;
};

type CandidateWithPrice = Candidate & {
  bestPrice: number;
  bestPlatform: string;
  bestUrl: string;
  quotes: StoreQuote[];
};

type RankedBuild = {
  totalPrice: number;
  score: number;
  performanceScore: number;
  valueForMoney: number;
  compatibilityScore: number;
  usecaseMatch: number;
  components: Record<ComponentType, CandidateWithPrice>;
  pros: string[];
  cons: string[];
  bestUseCase: string;
};

type ResponseData =
  | {
      topRecommendation: RankedBuild;
      alternatives: RankedBuild[];
      priceComparison: {
        bestPlatform: string;
        priceDifference: number;
        reason: string;
        shops: Array<{ platform: string; total: number; trust: number }>;
      };
      whyThisIsBest: string;
      warnings: string[];
      assistantMessage: string;
      meta: {
        currency: "INR";
        realtimeOnly: true;
        sources: string[];
        generatedAt: string;
      };
    }
  | { error: string };

const TRUST_SCORES: Record<string, number> = {
  "Amazon.in": 0.95,
  Flipkart: 0.92,
  MDComputers: 0.94,
  PrimeABGB: 0.93,
};

const PLATFORM_QUERIES: Array<{ name: string; site: string }> = [
  { name: "Amazon.in", site: "amazon.in" },
  { name: "Flipkart", site: "flipkart.com" },
  { name: "MDComputers", site: "mdcomputers.in" },
  { name: "PrimeABGB", site: "primeabgb.com" },
];

const CANDIDATES: Candidate[] = [
  { id: "cpu-12400f", type: "cpu", name: "Intel Core i5-12400F", brand: "Intel", performance: 74, reliability: 90, socket: "LGA1700", tdp: 65 },
  { id: "cpu-13400f", type: "cpu", name: "Intel Core i5-13400F", brand: "Intel", performance: 82, reliability: 90, socket: "LGA1700", tdp: 65 },
  { id: "cpu-5600", type: "cpu", name: "AMD Ryzen 5 5600", brand: "AMD", performance: 76, reliability: 91, socket: "AM4", tdp: 65 },
  { id: "cpu-5700x", type: "cpu", name: "AMD Ryzen 7 5700X", brand: "AMD", performance: 86, reliability: 91, socket: "AM4", tdp: 65 },

  { id: "gpu-4060", type: "gpu", name: "NVIDIA GeForce RTX 4060 8GB", brand: "NVIDIA", performance: 78, reliability: 89, vramGB: 8, tdp: 115 },
  { id: "gpu-4060ti", type: "gpu", name: "NVIDIA GeForce RTX 4060 Ti 8GB", brand: "NVIDIA", performance: 86, reliability: 89, vramGB: 8, tdp: 160 },
  { id: "gpu-rx7600", type: "gpu", name: "AMD Radeon RX 7600 8GB", brand: "AMD", performance: 75, reliability: 87, vramGB: 8, tdp: 165 },
  { id: "gpu-rx7700xt", type: "gpu", name: "AMD Radeon RX 7700 XT 12GB", brand: "AMD", performance: 90, reliability: 87, vramGB: 12, tdp: 245 },

  { id: "mobo-b760-ddr4", type: "motherboard", name: "MSI PRO B760M-A DDR4", brand: "MSI", performance: 72, reliability: 88, socket: "LGA1700", ramType: "DDR4" },
  { id: "mobo-b760-ddr5", type: "motherboard", name: "ASUS PRIME B760M-A DDR5", brand: "ASUS", performance: 76, reliability: 89, socket: "LGA1700", ramType: "DDR5" },
  { id: "mobo-b550-ddr4", type: "motherboard", name: "MSI B550M PRO-VDH WIFI", brand: "MSI", performance: 73, reliability: 89, socket: "AM4", ramType: "DDR4" },

  { id: "ram-16-ddr4", type: "ram", name: "Corsair Vengeance 16GB DDR4 3200", brand: "Corsair", performance: 70, reliability: 90, ramType: "DDR4", ramGB: 16 },
  { id: "ram-32-ddr4", type: "ram", name: "Corsair Vengeance 32GB DDR4 3200", brand: "Corsair", performance: 82, reliability: 90, ramType: "DDR4", ramGB: 32 },
  { id: "ram-16-ddr5", type: "ram", name: "Kingston Fury Beast 16GB DDR5 5600", brand: "Kingston", performance: 78, reliability: 88, ramType: "DDR5", ramGB: 16 },
  { id: "ram-32-ddr5", type: "ram", name: "Kingston Fury Beast 32GB DDR5 5600", brand: "Kingston", performance: 88, reliability: 88, ramType: "DDR5", ramGB: 32 },

  { id: "ssd-1tb", type: "ssd", name: "WD Blue SN580 1TB NVMe SSD", brand: "WD", performance: 80, reliability: 90 },
  { id: "ssd-500", type: "ssd", name: "Crucial P3 500GB NVMe SSD", brand: "Crucial", performance: 72, reliability: 88 },

  { id: "psu-650", type: "psu", name: "Corsair CX650 650W 80+ Bronze", brand: "Corsair", performance: 78, reliability: 91, wattage: 650 },
  { id: "psu-750", type: "psu", name: "Cooler Master MWE 750W 80+ Bronze", brand: "Cooler Master", performance: 82, reliability: 88, wattage: 750 },
];

function normalizePrice(value: string | number | undefined): number | null {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/Rs\.?/gi, "").replace(/[₹,\s]/g, "").trim();
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function platformFromLink(link: string): string {
  const lower = link.toLowerCase();
  if (lower.includes("amazon")) return "Amazon.in";
  if (lower.includes("flipkart")) return "Flipkart";
  if (lower.includes("mdcomputers")) return "MDComputers";
  if (lower.includes("primeabgb")) return "PrimeABGB";
  return "Unknown";
}

async function fetchPlatformQuote(product: string, platform: { name: string; site: string }): Promise<StoreQuote | null> {
  const key = process.env.SERP_API_KEY || process.env.SERPAPI_KEY;
  if (!key) return null;

  const query = encodeURIComponent(`${product} site:${platform.site} india`);
  const url = `https://serpapi.com/search.json?engine=google_shopping&google_domain=google.co.in&q=${query}&api_key=${key}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const items = Array.isArray(data.shopping_results) ? data.shopping_results : [];
    for (const item of items) {
      const rawPrice = item?.price;
      const price = normalizePrice(rawPrice);
      const link = String(item?.link || "");
      if (!price || !link) continue;

      const inferredPlatform = platformFromLink(link);
      if (inferredPlatform !== platform.name && inferredPlatform !== "Unknown") continue;

      return {
        platform: platform.name,
        price,
        url: link,
        trust: TRUST_SCORES[platform.name] ?? 0.8,
        inStock: true,
      };
    }
  } catch {
    return null;
  }

  return null;
}

async function getRealtimeQuotes(product: string): Promise<StoreQuote[]> {
  const quotes = await Promise.all(PLATFORM_QUERIES.map((p) => fetchPlatformQuote(product, p)));
  return quotes.filter((q): q is StoreQuote => Boolean(q));
}

function useCaseWeights(useCase: UseCase): Record<ComponentType, number> {
  if (useCase === "gaming") return { cpu: 0.25, gpu: 0.45, motherboard: 0.08, ram: 0.12, ssd: 0.05, psu: 0.05 };
  if (useCase === "coding") return { cpu: 0.38, gpu: 0.12, motherboard: 0.1, ram: 0.22, ssd: 0.1, psu: 0.08 };
  if (useCase === "editing") return { cpu: 0.3, gpu: 0.3, motherboard: 0.1, ram: 0.16, ssd: 0.08, psu: 0.06 };
  return { cpu: 0.32, gpu: 0.15, motherboard: 0.1, ram: 0.2, ssd: 0.13, psu: 0.1 };
}

function isCompatible(cpu: CandidateWithPrice, gpu: CandidateWithPrice, mobo: CandidateWithPrice, ram: CandidateWithPrice, ssd: CandidateWithPrice, psu: CandidateWithPrice): { ok: boolean; score: number; issues: string[] } {
  const issues: string[] = [];

  if (!cpu.socket || !mobo.socket || cpu.socket !== mobo.socket) {
    issues.push("CPU socket and motherboard do not match.");
  }

  if (!ram.ramType || !mobo.ramType || ram.ramType !== mobo.ramType) {
    issues.push("RAM type and motherboard RAM support do not match.");
  }

  if (!ram.ramGB || ram.ramGB < 16) {
    issues.push("RAM is below 16GB minimum.");
  }

  if (!ssd.name.toLowerCase().includes("ssd") && !ssd.name.toLowerCase().includes("nvme")) {
    issues.push("Build must include an SSD.");
  }

  const estimatedPower = (cpu.tdp || 65) + (gpu.tdp || 150) + 120;
  const requiredPSU = Math.ceil(estimatedPower * 1.4);
  if (!psu.wattage || psu.wattage < requiredPSU) {
    issues.push(`PSU is weak. Need at least ${requiredPSU}W with 40% headroom.`);
  }

  const diff = Math.abs(cpu.performance - gpu.performance);
  if (diff > 20) {
    issues.push("CPU-GPU bottleneck risk is high (>20% performance gap).");
  }

  const score = Math.max(0, 100 - issues.length * 20);
  return { ok: issues.length === 0, score, issues };
}

function getUseCaseMatchScore(useCase: UseCase, build: Record<ComponentType, CandidateWithPrice>, total: number): number {
  const cpuRatio = build.cpu.bestPrice / total;
  const gpuRatio = build.gpu.bestPrice / total;

  if (useCase === "gaming") {
    const gpuInRange = gpuRatio >= 0.4 && gpuRatio <= 0.5;
    const cpuInRange = cpuRatio >= 0.2 && cpuRatio <= 0.3;
    return gpuInRange && cpuInRange ? 95 : 70;
  }

  if (useCase === "coding") {
    return cpuRatio >= gpuRatio ? 92 : 72;
  }

  if (useCase === "editing") {
    return Math.abs(cpuRatio - gpuRatio) <= 0.1 ? 93 : 74;
  }

  return 85;
}

function rankBuild(
  useCase: UseCase,
  budget: number,
  build: Record<ComponentType, CandidateWithPrice>,
  compatibility: { score: number }
): RankedBuild {
  const totalPrice = Object.values(build).reduce((acc, item) => acc + item.bestPrice, 0);
  const componentPerf = (build.cpu.performance + build.gpu.performance + build.ram.performance + build.ssd.performance) / 4;
  const performanceScore = Math.min(100, componentPerf);

  const valueRaw = (performanceScore / totalPrice) * 100000;
  const valueForMoney = Math.min(100, valueRaw);

  const usecaseMatch = getUseCaseMatchScore(useCase, build, totalPrice);

  const score =
    0.4 * performanceScore +
    0.3 * valueForMoney +
    0.2 * compatibility.score +
    0.1 * usecaseMatch;

  const pros: string[] = [];
  const cons: string[] = [];

  if (build.gpu.brand === "NVIDIA") {
    pros.push("Better frame-generation ecosystem (DLSS) in many games.");
  } else {
    pros.push("Strong raster performance per rupee in this segment.");
  }

  if ((build.ram.ramGB || 16) >= 32) {
    pros.push("32GB RAM gives smoother multitasking and better longevity.");
  } else {
    cons.push("16GB RAM is fine today, but heavy editing workloads may need 32GB soon.");
  }

  if (totalPrice > budget) {
    cons.push("Slightly above budget; consider the value-focused alternative.");
  }

  return {
    totalPrice,
    score: Number(score.toFixed(2)),
    performanceScore: Number(performanceScore.toFixed(2)),
    valueForMoney: Number(valueForMoney.toFixed(2)),
    compatibilityScore: compatibility.score,
    usecaseMatch: usecaseMatch,
    components: build,
    pros,
    cons,
    bestUseCase: useCase,
  };
}

function chooseBestPlatformAcrossBuild(build: RankedBuild): { platform: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const part of Object.values(build.components)) {
    for (const quote of part.quotes) {
      totals.set(quote.platform, (totals.get(quote.platform) || 0) + quote.price);
    }
  }

  return Array.from(totals.entries())
    .map(([platform, total]) => ({ platform, total }))
    .sort((a, b) => a.total - b.total);
}

function shortAssistantMessage(best: RankedBuild): string {
  const gpu = best.components.gpu;
  return `Heads up: ${gpu.name} is the smartest pick right now at around ₹${gpu.bestPrice.toLocaleString("en-IN")}. It keeps the build balanced and avoids paying extra for tiny FPS gains.`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.SERP_API_KEY || process.env.SERPAPI_KEY;
  if (!key) {
    return res.status(503).json({ error: "Real-time price provider is not configured. Set SERP_API_KEY." });
  }

  const budget = Number(req.body?.budget);
  const useCase = String(req.body?.useCase || "gaming").toLowerCase() as UseCase;

  if (!Number.isFinite(budget) || budget < 30000) {
    return res.status(400).json({ error: "Invalid budget. Use at least ₹30,000 for practical builds." });
  }

  if (!["gaming", "coding", "editing", "general"].includes(useCase)) {
    return res.status(400).json({ error: "Invalid use case. Use gaming, coding, editing, or general." });
  }

  const candidatesByType: Record<ComponentType, CandidateWithPrice[]> = {
    cpu: [],
    gpu: [],
    motherboard: [],
    ram: [],
    ssd: [],
    psu: [],
  };

  const pricedCandidates = await Promise.all(
    CANDIDATES.map(async (candidate) => {
      const quotes = await getRealtimeQuotes(candidate.name);
      if (!quotes.length) return null;
      const sorted = quotes.sort((a, b) => a.price - b.price || b.trust - a.trust);
      const best = sorted[0];
      const withPrice: CandidateWithPrice = {
        ...candidate,
        bestPrice: best.price,
        bestPlatform: best.platform,
        bestUrl: best.url,
        quotes: sorted,
      };
      return withPrice;
    })
  );

  for (const candidate of pricedCandidates) {
    if (!candidate) continue;
    candidatesByType[candidate.type].push(candidate);
  }

  const missingTypes = (Object.keys(candidatesByType) as ComponentType[]).filter((t) => candidatesByType[t].length === 0);
  if (missingTypes.length > 0) {
    return res.status(503).json({
      error: `Live prices unavailable for required categories: ${missingTypes.join(", ")}. Try again in a minute.`,
    });
  }

  for (const type of Object.keys(candidatesByType) as ComponentType[]) {
    candidatesByType[type].sort((a, b) => a.bestPrice - b.bestPrice);
  }

  const topCPU = candidatesByType.cpu.slice(0, 4);
  const topGPU = candidatesByType.gpu.slice(0, 4);
  const topMobo = candidatesByType.motherboard.slice(0, 4);
  const topRAM = candidatesByType.ram.slice(0, 4);
  const topSSD = candidatesByType.ssd.slice(0, 3);
  const topPSU = candidatesByType.psu.slice(0, 3);

  const builds: RankedBuild[] = [];
  for (const cpu of topCPU) {
    for (const gpu of topGPU) {
      for (const motherboard of topMobo) {
        for (const ram of topRAM) {
          for (const ssd of topSSD) {
            for (const psu of topPSU) {
              const build = { cpu, gpu, motherboard, ram, ssd, psu };
              const total = cpu.bestPrice + gpu.bestPrice + motherboard.bestPrice + ram.bestPrice + ssd.bestPrice + psu.bestPrice;
              if (total > budget) continue;

              const compatibility = isCompatible(cpu, gpu, motherboard, ram, ssd, psu);
              if (!compatibility.ok) continue;

              builds.push(rankBuild(useCase, budget, build, compatibility));
            }
          }
        }
      }
    }
  }

  if (!builds.length) {
    return res.status(422).json({ error: "Could not find a fully compatible build under your budget with current live market prices." });
  }

  builds.sort((a, b) => b.score - a.score);

  const unique: RankedBuild[] = [];
  const seen = new Set<string>();
  for (const build of builds) {
    const keyCombo = [build.components.cpu.id, build.components.gpu.id, build.components.ram.id, build.components.motherboard.id].join("|");
    if (seen.has(keyCombo)) continue;
    seen.add(keyCombo);
    unique.push(build);
    if (unique.length === 3) break;
  }

  const topRecommendation = unique[0];
  const alternatives = unique.slice(1, 3);

  const platformTotals = chooseBestPlatformAcrossBuild(topRecommendation);
  const best = platformTotals[0];
  const second = platformTotals[1];

  const priceComparison = {
    bestPlatform: best?.platform || topRecommendation.components.gpu.bestPlatform,
    priceDifference: best && second ? Math.max(0, Math.round(second.total - best.total)) : 0,
    reason: "Selected using lowest reliable total + trust score preference for Indian stores.",
    shops: platformTotals.slice(0, 4).map((p) => ({
      platform: p.platform,
      total: Math.round(p.total),
      trust: TRUST_SCORES[p.platform] || 0.85,
    })),
  };

  const whyThisIsBest = `Best overall because it balances CPU-GPU performance, stays compatible, and gives stronger real-world value per rupee. ${topRecommendation.components.gpu.name} and ${topRecommendation.components.cpu.name} are matched to avoid bottlenecking.`;

  const warnings: string[] = [];
  if ((topRecommendation.components.ram.ramGB || 16) === 16 && (useCase === "editing" || useCase === "coding")) {
    warnings.push("For heavier editing/coding, consider 32GB RAM soon.");
  }
  if (topRecommendation.totalPrice > budget * 0.98) {
    warnings.push("Prices are volatile; this build is near budget ceiling. Recheck before checkout.");
  }

  return res.status(200).json({
    topRecommendation,
    alternatives,
    priceComparison,
    whyThisIsBest,
    warnings,
    assistantMessage: shortAssistantMessage(topRecommendation),
    meta: {
      currency: "INR",
      realtimeOnly: true,
      sources: PLATFORM_QUERIES.map((p) => p.name),
      generatedAt: new Date().toISOString(),
    },
  });
}
