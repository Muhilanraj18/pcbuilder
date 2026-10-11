import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ArrowLeft, IndianRupee, Info, MapPin, Shield, Filter, ShoppingCart, ExternalLink } from 'lucide-react';
import Head from 'next/head';
import type { PCPart, Shop } from '@/types';
import { getPriceUpdateInfo } from '@/utils/marketPrices';
import { buildAffiliateUrl, getPlatformColor } from '@/utils/affiliate';
import { getProductInfo } from '@/utils/productLinks';
import { trackAffiliateClick } from '@/utils/useAnalytics';
import PriceHistoryChart from '@/components/PriceHistoryChart';

interface PartDetailsResponse {
  part: PCPart;
  alternatives: PCPart[];
  shops: Shop[];
}

function BuyButtonLarge({ url, platform, productName, price, category }: {
  url: string; platform: string; productName: string; price: number; category: string;
}) {
  const colors = getPlatformColor(platform);
  const affiliateUrl = buildAffiliateUrl(url);

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackAffiliateClick(productName, platform, price, category)}
      className={`flex items-center justify-center gap-2 px-5 py-3 ${colors.bg} ${colors.hover} ${colors.text} text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg`}
    >
      <ShoppingCart className="w-4 h-4" />
      Buy on {platform}
      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
    </a>
  );
}

const PartDetailPage: React.FC = () => {
  const router = useRouter();
  const { id, partData, category } = router.query;
  const [part, setPart] = React.useState<PCPart | null>(null);
  const [shops, setShops] = React.useState<Shop[]>([]);
  const [alternatives, setAlternatives] = React.useState<PCPart[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAlternatives, setShowAlternatives] = React.useState(true);
  const [brandFilter, setBrandFilter] = React.useState<string>('all');

  React.useEffect(() => {
    fetchPartFromAPI();
  }, [id, partData, category]);

  const fetchPartFromAPI = async () => {
    setLoading(true);
    let queryPart: PCPart | null = null;

    if (partData) {
      try {
        queryPart = JSON.parse(decodeURIComponent(partData as string));
        setPart(queryPart);
      } catch (error) {
        console.error('Error parsing part data:', error);
      }
    }

    try {
      const params = new URLSearchParams();
      if (queryPart?.name) params.set('name', queryPart.name);
      if (queryPart?.category) params.set('category', queryPart.category);
      if (!queryPart?.category && typeof category === 'string') params.set('category', category);

      const response = await fetch(`/api/parts/${id}?${params.toString()}`);
      if (response.ok) {
        const data: PartDetailsResponse = await response.json();
        setPart(queryPart || data.part);
        setAlternatives(data.alternatives || []);
        setShops(data.shops || []);
      }
    } catch (error) {
      console.error('Error fetching part:', error);
      if (queryPart) setPart(queryPart);
    }
    setLoading(false);
  };

  if (loading || !part) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading component details...</p>
        </div>
      </div>
    );
  }

  const productInfo = getProductInfo(part.name);
  const buyLinks = part.buyLinks || productInfo.buyLinks;
  const imageUrl = part.imageUrl || part.image || productInfo.imageUrl;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: part.name,
    category: part.category,
    image: imageUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: part.price,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Head>
        <title>{part.name} Price & Alternatives | PC Builder India</title>
        <meta name="description" content={`Compare ${part.name} price, alternatives, price history, and trusted shops in India.`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      </Head>
      <div className="min-h-screen px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Build
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Part Details — Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1">{part.category}</div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{part.name}</h1>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-3xl font-bold text-primary-600">
                    <IndianRupee className="w-7 h-7" />
                    {part.price.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Updated: {getPriceUpdateInfo().lastUpdate}</div>
                  <div className="text-xs text-green-600 mt-1">✓ From {getPriceUpdateInfo().source}</div>
                </div>
              </div>

              {/* Product Image */}
              <div className="w-full h-64 bg-gray-50 rounded-xl mb-6 flex items-center justify-center border border-gray-200 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={part.name} className="max-h-full max-w-full object-contain p-4" loading="lazy" />
                ) : (
                  <span className="text-6xl">⚡</span>
                )}
              </div>

              {/* Buy Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {buyLinks?.amazon && (
                  <BuyButtonLarge url={buyLinks.amazon} platform="Amazon" productName={part.name} price={part.price} category={part.category} />
                )}
                {buyLinks?.flipkart && (
                  <BuyButtonLarge url={buyLinks.flipkart} platform="Flipkart" productName={part.name} price={part.price} category={part.category} />
                )}
                {buyLinks?.mdcomputers && (
                  <BuyButtonLarge url={buyLinks.mdcomputers} platform="MDComputers" productName={part.name} price={part.price} category={part.category} />
                )}
              </div>

              {/* Why Recommended */}
              {part.whyRecommended && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Why We Recommend This</h3>
                      <p className="text-gray-700 leading-relaxed">{part.whyRecommended}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Specifications */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(part.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">{key}</span>
                      <span className="text-gray-900 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compatibility */}
              {part.compatibility.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" /> Compatible With
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {part.compatibility.map((item, index) => (
                      <span key={index} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Price History Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <PriceHistoryChart
                productName={part.name}
                currentPrice={part.price}
                releaseYear={part.releaseYear || productInfo.releaseYear}
              />
            </motion.div>

            {/* Brand Alternatives */}
            {showAlternatives && alternatives.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary-600" /> Similar Options
                  </h3>
                  <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                    <option value="all">All Brands</option>
                    <option value="Intel">Intel</option>
                    <option value="AMD">AMD</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {alternatives
                    .filter(alt => {
                      if (brandFilter === 'all') return true;
                      const specsBrand = alt.specs.Brand || alt.specs.brand || '';
                      return specsBrand === brandFilter || alt.name.toLowerCase().includes(brandFilter.toLowerCase());
                    })
                    .map((alternative) => {
                      const altInfo = getProductInfo(alternative.name);
                      const altImage = alternative.imageUrl || alternative.image || altInfo.imageUrl;
                      return (
                        <div key={alternative.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group">
                          <div className="flex gap-3">
                            {altImage && (
                              <img src={altImage} alt={alternative.name} className="w-16 h-16 object-contain rounded-lg bg-gray-100 p-1" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">{alternative.specs.Brand || alternative.specs.brand || 'Alternative'}</div>
                                  <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{alternative.name}</h4>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center text-lg font-bold text-primary-600">
                                    <IndianRupee className="w-4 h-4" />
                                    {alternative.price.toLocaleString()}
                                  </div>
                                  <div className={`text-xs font-medium ${alternative.price > part!.price ? 'text-red-600' : 'text-green-600'}`}>
                                    {alternative.price > part!.price ? '+' : '-'}₹{Math.abs(alternative.price - part!.price).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{alternative.whyRecommended}</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(alternative.specs).slice(0, 3).map(([key, value]) => (
                                  key !== 'Brand' && <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button className="w-full mt-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-semibold hover:bg-primary-100 transition-colors"
                            onClick={() => setPart(alternative)}>
                            View This Option
                          </button>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      All alternatives are tested for compatibility. Choose based on brand preference and budget.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Shops Sidebar — Right Column */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-lg sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-900">Where to Buy</h3>
              </div>

              {/* Online Buy Links */}
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Buy Online</h4>
                {buyLinks?.amazon && (
                  <BuyButtonLarge url={buyLinks.amazon} platform="Amazon" productName={part.name} price={part.price} category={part.category} />
                )}
                {buyLinks?.flipkart && (
                  <BuyButtonLarge url={buyLinks.flipkart} platform="Flipkart" productName={part.name} price={part.price} category={part.category} />
                )}
                {buyLinks?.mdcomputers && (
                  <BuyButtonLarge url={buyLinks.mdcomputers} platform="MDComputers" productName={part.name} price={part.price} category={part.category} />
                )}
              </div>

              {/* Physical Shops */}
              {shops.length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Physical Stores</h4>
                  <div className="space-y-3">
                    {shops.map((shop) => (
                      <div key={shop.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">{shop.name}</h4>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-semibold">{shop.rating}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3" />
                            {shop.branches[0]?.area} {shop.branches[0]?.distance ? `• ${shop.branches[0].distance} km` : ''}
                          </div>
                        </div>
                        {shop.onlineStore && (
                          <a href={buildAffiliateUrl(shop.onlineStore)} target="_blank" rel="noopener noreferrer"
                            onClick={() => trackAffiliateClick(part.name, 'Store', part.price, part.category)}
                            className="block w-full text-center px-3 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                            Visit Store
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default PartDetailPage;
