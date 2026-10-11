// Type definitions for PC Builder application

export type Budget = number; // Allow any budget amount

export type MonitorChoice = 'with' | 'without';

export type UseCase = 'coding' | 'gaming' | 'graphics' | 'general';

export interface UseCaseOption {
  id: UseCase;
  title: string;
  description: string;
  icon: string;
  highlight?: boolean;
}

export type ComponentCategory = 
  | 'Processor' 
  | 'Motherboard' 
  | 'RAM' 
  | 'Graphics Card' 
  | 'Storage' 
  | 'Power Supply' 
  | 'Cabinet' 
  | 'Monitor' 
  | 'Cooler' 
  | 'Keyboard' 
  | 'Mouse';

export interface BuyLinks {
  amazon?: string;
  flipkart?: string;
  mdcomputers?: string;
  primeabgb?: string;
}

export interface PriceHistoryPoint {
  date: string; // ISO date string
  price: number;
  source?: string;
}

export interface PCPart {
  id: string;
  name: string;
  category: ComponentCategory;
  price: number;
  image?: string;
  imageUrl?: string; // Real product image URL
  specs: Record<string, string>;
  compatibility: string[];
  whyRecommended?: string;
  isEssential?: boolean; // Mark if component is required
  easyExplanation?: string; // Simple explanation for beginners
  buyLinks?: BuyLinks; // Direct affiliate purchase links
  priceHistory?: PriceHistoryPoint[]; // Historical price data
  brand?: string; // Product brand for filtering
  releaseYear?: number; // For price history generation
}

export interface PCBuild {
  id: string;
  budget: Budget;
  withMonitor: boolean;
  useCase?: UseCase;
  parts: PCPart[];
  totalPrice: number;
  savings?: number;
  assistantMessage?: string;
  warnings?: string[];
  livePricing?: {
    enabled: boolean;
    sources?: string[];
    updatedAt?: string;
    savingsFromBestDeals?: number;
  };
}

export interface Shop {
  id: string;
  name: string;
  rating: number;
  location: string;
  branches: ShopBranch[];
  onlineStore?: string;
  phone?: string;
}

export interface ShopBranch {
  area: string;
  address: string;
  distance?: number;
}

export interface UpgradeRecommendation {
  currentPart: PCPart;
  recommendedPart: PCPart;
  reason: string;
  performance: string;
  compatibility: 'compatible' | 'incompatible';
  incompatibilityReason?: string;
}

export interface RealtimeBuildRecommendation {
  totalPrice: number;
  score: number;
  performanceScore: number;
  valueForMoney: number;
  compatibilityScore: number;
  usecaseMatch: number;
  components: Record<string, {
    id: string;
    name: string;
    brand: string;
    bestPrice: number;
    bestPlatform: string;
    bestUrl: string;
  }>;
  pros: string[];
  cons: string[];
  bestUseCase: string;
}

export interface RealtimeAssistantResponse {
  topRecommendation: RealtimeBuildRecommendation;
  alternatives: RealtimeBuildRecommendation[];
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
    currency: 'INR';
    realtimeOnly: true;
    sources: string[];
    generatedAt: string;
  };
}

export interface BuildConfig {
  budget?: Budget;
  withMonitor?: boolean;
  useCase?: UseCase;
}

export interface CurrentPC {
  processor?: PCPart;
  motherboard?: PCPart;
  ram?: PCPart;
  graphicsCard?: PCPart;
  storage?: PCPart;
  powerSupply?: PCPart;
  cabinet?: PCPart;
  monitor?: PCPart;
}

export interface APIBuildRequest {
  budget: number;
  withMonitor: boolean;
  useCase?: UseCase;
}

export interface APIUpgradeRequest {
  currentPC: CurrentPC;
}
