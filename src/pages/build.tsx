import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  ArrowLeft, IndianRupee, Info, MapPin, Share2, Cpu, HardDrive,
  MemoryStick, Zap, MonitorCheck, Box, Fan, Keyboard, Mouse,
  Eye, EyeOff, ShoppingCart, ExternalLink, BookOpen, Mail,
  Youtube, Navigation, CheckCircle, Copy, Pencil
} from 'lucide-react';
import Head from 'next/head';
import ProgressBar from '@/components/ProgressBar';
import dynamic from 'next/dynamic';
import type { PCBuild, PCPart, ComponentCategory } from '@/types';
import { getPriceUpdateInfo } from '@/utils/marketPrices';
import { buildAffiliateUrl, getPlatformColor } from '@/utils/affiliate';
import { getProductInfo } from '@/utils/productLinks';
import { trackAffiliateClick, trackBuildComplete } from '@/utils/useAnalytics';

// Dynamically import 3D viewer to avoid SSR issues
const PC3DViewer = dynamic(() => import('@/components/PC3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-2xl">
      <div className="text-white">Loading 3D View...</div>
    </div>
  ),
});

// Component icons and key spec keys per category
const componentInfo: Record<ComponentCategory, {
  icon: any;
  explanation: string;
  keySpecs: string[];
}> = {
  'Processor':    { icon: Cpu,          explanation: 'The brain of your PC — handles all calculations and processing', keySpecs: ['cores', 'threads', 'brand'] },
  'Motherboard':  { icon: Cpu,          explanation: 'Connects all components together — like the nervous system',    keySpecs: ['socket', 'formFactor', 'chipset'] },
  'RAM':          { icon: MemoryStick,  explanation: 'Short-term memory — helps run multiple programs smoothly',      keySpecs: ['capacity', 'type', 'speed'] },
  'Graphics Card':{ icon: Zap,          explanation: 'Handles graphics and games — makes visuals smooth',             keySpecs: ['vram', 'type'] },
  'Storage':      { icon: HardDrive,    explanation: 'Stores all your files, photos, and programs permanently',       keySpecs: ['capacity', 'type', 'speed'] },
  'Power Supply': { icon: Zap,          explanation: 'Provides electricity to all components',                        keySpecs: ['wattage', 'efficiency'] },
  'Cabinet':      { icon: Box,          explanation: 'The case that holds and protects all your components',          keySpecs: ['type'] },
  'Monitor':      { icon: MonitorCheck, explanation: 'Your screen — displays everything you see and do',             keySpecs: ['size', 'resolution', 'refresh'] },
  'Cooler':       { icon: Fan,          explanation: 'Keeps your processor cool — prevents overheating',             keySpecs: ['type', 'fans'] },
  'Keyboard':     { icon: Keyboard,     explanation: 'For typing and controlling your PC',                           keySpecs: ['type', 'connectivity'] },
  'Mouse':        { icon: Mouse,        explanation: 'For pointing, clicking, and navigating',                       keySpecs: ['type', 'connectivity'] },
};

// Static price display — no network calls, no polling
function StaticPrice({ price, lastUpdated }: { price: number; lastUpdated: string }) {
  return (
    <div className="text-right">
      <div className="text-xl font-bold text-gray-900">
        ₹{price.toLocaleString('en-IN')}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">
        Verified {lastUpdated}
      </div>
    </div>
  );
}

// Buy button component for affiliate links
function BuyButton({ url, platform, productName, price, category }: {
  url: string; platform: string; productName: string; price: number; category: string;
}) {
  const colors = getPlatformColor(platform);
  const affiliateUrl = buildAffiliateUrl(url);

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation();
        trackAffiliateClick(productName, platform, price, category);
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} ${colors.hover} ${colors.text} text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md`}
    >
      <ShoppingCart className="w-3 h-3" />
      {platform}
      <ExternalLink className="w-3 h-3 opacity-60" />
    </a>
  );
}

// Category SVG icon placeholder (replaces colored placehold.co boxes)
function CategoryIcon({ category, className = '' }: { category: string; className?: string }) {
  const info = componentInfo[category as ComponentCategory];
  const IconComponent = info ? info.icon : Box;
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg ${className}`}>
      <IconComponent className="w-10 h-10 text-gray-400" />
    </div>
  );
}

// Mini spec table — shows only 3-4 key specs per category
function SpecTable({ specs, keySpecs }: { specs: Record<string, string>; keySpecs: string[] }) {
  const entries = keySpecs
    .filter(k => specs[k])
    .map(k => [k, specs[k]] as [string, string]);

  if (entries.length === 0) {
    // fallback: show first 3 whatever keys exist
    const fallback = Object.entries(specs).slice(0, 3);
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {fallback.map(([k, v]) => (
          <React.Fragment key={k}>
            <span className="text-gray-500 capitalize truncate">{k}</span>
            <span className="text-gray-800 font-medium truncate">{v}</span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      {entries.map(([k, v]) => (
        <React.Fragment key={k}>
          <span className="text-gray-500 capitalize truncate">{k}</span>
          <span className="text-gray-800 font-medium truncate">{v}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

const BuildPage: React.FC = () => {
  const router = useRouter();
  const { budget, monitor, useCase } = router.query;
  const [build, setBuild] = React.useState<PCBuild | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [show3DView, setShow3DView] = React.useState(true);
  const [shareToast, setShareToast] = React.useState(false);
  const [selectedPart, setSelectedPart] = React.useState<PCPart | null>(null);

  const priceInfo = getPriceUpdateInfo();

  React.useEffect(() => {
    const fetchBuild = async () => {
      if (budget) {
        setLoading(true);
        try {
          const response = await fetch('/api/build', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              budget: parseInt(budget as string),
              withMonitor: monitor === 'with',
              useCase: useCase as string,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setBuild(data);
            trackBuildComplete(data.budget, data.totalPrice, data.parts.length, data.useCase);
          }
        } catch (error) {
          console.error('Error fetching build:', error);
        }
        setLoading(false);
      }
    };

    fetchBuild();
  }, [budget, monitor, useCase]);

  const handlePartClick = (part: PCPart) => {
    setSelectedPart(part);
  };

  const getComponentInfo = (category: string) => {
    return componentInfo[category as ComponentCategory] || { icon: Box, explanation: 'PC Component', keySpecs: [] };
  };

  // Get buy links for a part
  const getPartBuyLinks = (part: PCPart) => {
    if (part.buyLinks) return part.buyLinks;
    const info = getProductInfo(part.name);
    return info.buyLinks;
  };

  // Get image for a part — returns null if no real image (no placehold.co fallback)
  const getPartImage = (part: PCPart): string | null => {
    const url = part.imageUrl || part.image || getProductInfo(part.name).imageUrl;
    if (!url || url.includes('placehold.co')) return null;
    return url;
  };

  // Share build URL
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `PC Build ₹${build?.budget.toLocaleString('en-IN')} | PC Builder India`,
      text: `Check out this ${build?.useCase || 'general'} PC build for ₹${build?.totalPrice.toLocaleString('en-IN')}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch {
      // User cancelled share — do nothing
    }
  };

  // Find shops via geolocation
  const handleFindShops = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          window.open(
            `https://www.google.com/maps/search/PC+component+store/@${latitude},${longitude},13z`,
            '_blank',
            'noopener,noreferrer'
          );
        },
        () => {
          // Permission denied or unavailable — open generic search
          window.open(
            'https://www.google.com/maps/search/PC+components+store+near+me',
            '_blank',
            'noopener,noreferrer'
          );
        }
      );
    } else {
      window.open(
        'https://www.google.com/maps/search/PC+components+store+near+me',
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  if (loading || !build) {
    return (
      <div className="min-h-screen px-4 py-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your perfect PC build...</p>
        </div>
      </div>
    );
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Recommended PC Build Components',
    itemListElement: build.parts.map((part, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: part.name,
        category: part.category,
        offers: { '@type': 'Offer', priceCurrency: 'INR', price: part.price },
      },
    })),
  };

  return (
    <>
      <Head>
        <title>PC Build Result Under ₹{build.budget.toLocaleString('en-IN')} | PC Builder India</title>
        <meta name="description" content="View your compatible PC build with verified Indian prices, component details, and shop links." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      </Head>

      <div className="min-h-screen px-4 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">

          {/* Back Button */}
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>

          <ProgressBar currentStep={4} totalSteps={4} />

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Perfect PC Build</h1>
            <p className="text-lg text-gray-600">All components work together perfectly — 100% compatible</p>
          </motion.div>

          {/* Build Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-5 shadow-lg mb-6 border border-primary-200"
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <div className="text-sm text-primary-700 font-medium mb-1">Total Price</div>
                <div className="flex items-center text-4xl font-bold text-gray-900">
                  <IndianRupee className="w-8 h-8" />
                  {build.totalPrice.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-gray-600 mt-1">Budget: ₹{build.budget.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-400 mt-1">💰 Prices verified: {priceInfo.lastUpdate}</div>
              </div>

              {build.savings && build.savings > 0 && (
                <div className="bg-green-500 text-white px-5 py-3 rounded-xl shadow-md">
                  <div className="text-sm font-medium">You Saved</div>
                  <div className="text-2xl font-bold">₹{build.savings.toLocaleString('en-IN')}</div>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShow3DView(!show3DView)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-md border border-gray-200"
                >
                  {show3DView ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  {show3DView ? 'Hide' : 'Show'} 3D
                </button>

                <button
                  id="share-build-btn"
                  onClick={handleShare}
                  className="relative flex items-center gap-2 px-5 py-2 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-md border border-primary-200"
                >
                  {shareToast ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                  {shareToast ? 'Link Copied!' : 'Share'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Split Layout */}
          <div className={`grid gap-8 ${show3DView ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} mb-8`}>
            {show3DView && (
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-2">
                <div className="lg:sticky lg:top-8 space-y-4">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2"><Eye className="w-5 h-5" /> 3D Build Preview</h3>
                      <p className="text-primary-100 text-sm mt-1">Drag to rotate • Scroll to zoom</p>
                    </div>
                    <div className="h-96 bg-gray-900"><PC3DViewer parts={build.parts} /></div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">Build Summary</h4>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Components</span>
                        <span className="font-semibold text-gray-900">{build.parts.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Price</span>
                        <span className="font-semibold text-gray-900">₹{build.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Budget</span>
                        <span className="font-semibold text-gray-900">₹{build.budget.toLocaleString('en-IN')}</span>
                      </div>
                      {build.savings && build.savings > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="text-sm text-green-600 font-medium">You Saved</span>
                          <span className="font-bold text-green-600">₹{build.savings.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Parts Grid */}
            <div className={show3DView ? 'lg:col-span-3' : 'lg:col-span-1'}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {build.parts.map((part, index) => {
                  const info = getComponentInfo(part.category);
                  const buyLinks = getPartBuyLinks(part);
                  const imageUrl = getPartImage(part);

                  return (
                    <motion.div
                      key={part.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 * index }}
                      onClick={() => handlePartClick(part)}
                      className="bg-white rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:border-primary-300 border-2 border-transparent transition-all flex flex-col h-full"
                    >
                      {/* Fixed-height image area */}
                      <div className="h-40 flex-shrink-0 bg-gray-50 rounded-t-xl overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={part.name}
                            className="w-full h-full object-contain p-3"
                            loading="lazy"
                          />
                        ) : (
                          <CategoryIcon category={part.category} className="w-full h-full rounded-t-xl" />
                        )}
                      </div>

                      {/* Card body */}
                      <div className="flex flex-col flex-1 p-4 gap-3">
                        {/* Category + badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                            {part.category}
                          </span>
                          {part.isEssential && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                              Essential
                            </span>
                          )}
                        </div>

                        {/* Product name — 2-line clamp */}
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
                          {part.name}
                        </h3>

                        {/* Key specs mini-table */}
                        <div className="flex-1">
                          <SpecTable specs={part.specs} keySpecs={info.keySpecs} />
                        </div>

                        {/* Price + buy buttons pinned to bottom */}
                        <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-gray-900">
                              ₹{part.price.toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePartClick(part); }}
                              className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                            >
                              <MapPin className="w-3.5 h-3.5" /> Details
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {buyLinks?.amazon && (
                              <BuyButton url={buyLinks.amazon} platform="Amazon" productName={part.name} price={part.price} category={part.category} />
                            )}
                            {buyLinks?.flipkart && (
                              <BuyButton url={buyLinks.flipkart} platform="Flipkart" productName={part.name} price={part.price} category={part.category} />
                            )}
                            {buyLinks?.mdcomputers && (
                              <BuyButton url={buyLinks.mdcomputers} platform="MDComputers" productName={part.name} price={part.price} category={part.category} />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            {/* Modify This Build — Phase 2 info */}
            <button
              id="modify-build-btn"
              onClick={() => {
                document.getElementById('modify-info')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 justify-center px-8 py-4 bg-white border-2 border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              <Pencil className="w-5 h-5" />
              Modify This Build
            </button>

            <button
              id="find-shops-btn"
              onClick={handleFindShops}
              className="flex items-center gap-2 justify-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 shadow-lg transition-all"
            >
              <Navigation className="w-5 h-5" />
              Find Shops Near Me
            </button>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8"
          >
            <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-gray-700 text-sm mb-4">
              Click on any component card above to see full specs, why we picked it, and beginner-friendly explanations.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                id="component-guide-btn"
                href="/guide"
                className="inline-flex items-center gap-1.5 text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Component Guide
              </a>
              <a
                id="assembly-tutorial-btn"
                href="https://www.youtube.com/watch?v=PXaLc9AYIcg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <Youtube className="w-4 h-4" /> Assembly Tutorial
              </a>
              <a
                id="contact-us-btn"
                href="mailto:support@pcbuilderindia.in"
                className="inline-flex items-center gap-1.5 text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <Mail className="w-4 h-4" /> Contact Us
              </a>
            </div>
          </motion.div>

          {/* Modify Info Panel (Phase 2 placeholder) */}
          <motion.div
            id="modify-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Want to Swap a Component?</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  To change a specific part (e.g. switch to a different CPU or more RAM), go back and adjust your budget
                  or use-case — or click any component card to see full details and buy links from multiple stores.
                  A full component-swap panel is coming soon.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Part Detail Modal */}
          {selectedPart && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPart(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-primary-200 text-xs font-semibold uppercase tracking-wide mb-1">
                        {selectedPart.category}
                      </div>
                      <h2 className="text-white font-bold text-lg leading-snug">{selectedPart.name}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedPart(null)}
                      className="text-primary-200 hover:text-white transition-colors ml-4 mt-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-2xl font-bold text-white mt-3">
                    ₹{selectedPart.price.toLocaleString('en-IN')}
                    <span className="text-primary-200 text-sm font-normal ml-2">Verified {priceInfo.lastUpdate}</span>
                  </div>
                </div>

                {/* Modal body */}
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Image */}
                  <div className="h-48 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                    {getPartImage(selectedPart) ? (
                      <img
                        src={getPartImage(selectedPart)!}
                        alt={selectedPart.name}
                        className="h-full object-contain p-3"
                      />
                    ) : (
                      <CategoryIcon category={selectedPart.category} className="w-full h-full" />
                    )}
                  </div>

                  {/* What is this? */}
                  {(() => {
                    const info = getComponentInfo(selectedPart.category);
                    return (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-xs font-semibold text-blue-900 mb-1">What is this?</div>
                        <p className="text-sm text-blue-800">{info.explanation}</p>
                      </div>
                    );
                  })()}

                  {/* Easy Explanation (moved from card to here) */}
                  {selectedPart.easyExplanation && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-1">In plain English</div>
                      <p className="text-sm text-gray-700">{selectedPart.easyExplanation}</p>
                    </div>
                  )}

                  {/* Why Recommended (moved from card to here) */}
                  {selectedPart.whyRecommended && (
                    <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                      <div className="text-xs font-semibold text-primary-700 mb-1">Why we picked this</div>
                      <p className="text-sm text-primary-800">{selectedPart.whyRecommended}</p>
                    </div>
                  )}

                  {/* All specs */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Specs</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {Object.entries(selectedPart.specs).map(([k, v]) => (
                        <React.Fragment key={k}>
                          <span className="text-gray-500 capitalize">{k}</span>
                          <span className="text-gray-900 font-medium">{v}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Buy links */}
                  {(() => {
                    const buyLinks = getPartBuyLinks(selectedPart);
                    const hasLinks = buyLinks?.amazon || buyLinks?.flipkart || buyLinks?.mdcomputers;
                    return hasLinks ? (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Buy Now</div>
                        <div className="flex flex-wrap gap-2">
                          {buyLinks?.amazon && (
                            <BuyButton url={buyLinks.amazon} platform="Amazon" productName={selectedPart.name} price={selectedPart.price} category={selectedPart.category} />
                          )}
                          {buyLinks?.flipkart && (
                            <BuyButton url={buyLinks.flipkart} platform="Flipkart" productName={selectedPart.name} price={selectedPart.price} category={selectedPart.category} />
                          )}
                          {buyLinks?.mdcomputers && (
                            <BuyButton url={buyLinks.mdcomputers} platform="MDComputers" productName={selectedPart.name} price={selectedPart.price} category={selectedPart.category} />
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </motion.div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default BuildPage;
