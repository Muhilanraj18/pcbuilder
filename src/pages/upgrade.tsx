import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ArrowLeft, Upload, Cpu, HardDrive, MemoryStick, Zap, MonitorCheck, Box, Fan, TrendingUp, AlertCircle, CheckCircle2, XCircle, Plus, Trash2, Search, X } from 'lucide-react';
import Head from 'next/head';

import type { UpgradeRecommendation, PCPart, CurrentPC, ComponentCategory } from '@/types';
import { componentPrices } from '@/utils/marketPrices';

// Component icons mapping
const componentIcons: Record<string, any> = {
  Processor: Cpu,
  Motherboard: Cpu,
  RAM: MemoryStick,
  'Graphics Card': Zap,
  Storage: HardDrive,
  'Power Supply': Zap,
  Cabinet: Box,
  Monitor: MonitorCheck,
  Cooler: Fan,
};

const UpgradePage: React.FC = () => {
  const router = useRouter();
  const [currentPC, setCurrentPC] = React.useState<CurrentPC>({});
  const [recommendations, setRecommendations] = React.useState<UpgradeRecommendation[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showComponentSelector, setShowComponentSelector] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<ComponentCategory | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const componentCategories: ComponentCategory[] = [
    'Processor',
    'Motherboard',
    'RAM',
    'Graphics Card',
    'Storage',
    'Power Supply',
    'Cabinet',
    'Monitor',
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      setLoading(true);
      
      // Send to backend API
      const formData = new FormData();
      formData.append('specs', file);
      
      try {
        const response = await fetch('/api/upgrade/analyze', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentPC(data.currentPC);
          setRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error('Error analyzing specs:', error);
      }
      
      setLoading(false);
    }
  };

  const handleAddComponent = (category: ComponentCategory, component: PCPart) => {
    setCurrentPC(prev => ({
      ...prev,
      [category.toLowerCase().replace(' ', '')]: component,
    }));
    setShowModal(false);
    setSearchTerm('');
  };

  const openComponentModal = (category: ComponentCategory) => {
    setSelectedCategory(category);
    setShowModal(true);
    setSearchTerm('');
  };

  const getAvailableComponents = (): Array<{name: string; price: number}> => {
    if (!selectedCategory) return [];
    
    const categoryMap: Record<ComponentCategory, any> = {
      'Processor': componentPrices.processors,
      'Graphics Card': componentPrices.graphicsCards,
      'Motherboard': componentPrices.motherboards,
      'RAM': componentPrices.ram,
      'Storage': componentPrices.storage,
      'Power Supply': componentPrices.powerSupplies,
      'Cabinet': componentPrices.cabinets,
      'Monitor': componentPrices.monitors,
      'Cooler': componentPrices.cooling,
      'Keyboard': componentPrices.keyboards,
      'Mouse': componentPrices.mice,
    };

    const categoryData = categoryMap[selectedCategory];
    if (!categoryData) {
      console.warn(`No data found for category: ${selectedCategory}`);
      return [];
    }

    const allComponents: Array<{name: string; price: number}> = [];

    // Handle tiered components (processors, graphics cards)
    if (selectedCategory === 'Processor' || selectedCategory === 'Graphics Card') {
      // These have budget/mid/high/enthusiast tiers
      Object.values(categoryData).forEach((tier: any) => {
        if (typeof tier === 'object' && tier !== null) {
          Object.entries(tier).forEach(([name, price]) => {
            if (typeof price === 'number') {
              allComponents.push({ name, price });
            }
          });
        }
      });
    } else {
      // Flat structure for other components
      if (typeof categoryData === 'object' && categoryData !== null) {
        Object.entries(categoryData).forEach(([name, price]) => {
          if (typeof price === 'number') {
            allComponents.push({ name, price });
          }
        });
      }
    }

    console.log(`Found ${allComponents.length} components for ${selectedCategory}`);
    return allComponents;
  };

  const filteredComponents = getAvailableComponents().filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.price - a.price); // Sort by price descending

  const handleRemoveComponent = (category: string) => {
    setCurrentPC(prev => {
      const updated = { ...prev };
      delete updated[category as keyof CurrentPC];
      return updated;
    });
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    
    try {
      console.log('Sending current PC:', currentPC);
      
      const response = await fetch('/api/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPC }),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          setRecommendations(data);
        } else {
          console.warn('No recommendations received');
          alert('No upgrade recommendations available for the selected components right now.');
        }
      } else {
        const errorText = await response.text();
        console.error('API error:', errorText);
        alert('Error getting recommendations. Please try again in a moment.');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert('Cannot connect to recommendation service. Please check your network and retry.');
    }
    
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>PC Upgrade Advisor India | Compatibility-safe Upgrades</title>
        <meta name="description" content="Get compatibility-checked PC upgrade recommendations with live India pricing and part comparisons." />
      </Head>
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your PC
          </h1>
          <p className="text-lg text-gray-600">
            Select your current components or upload specs to get safe upgrade recommendations
          </p>
        </motion.div>

        {/* Upload or Select Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload File */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Upload PC Specs
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Upload a file from CPU-Z, Speccy, or other PC info tools
              </p>

              <label className="inline-block">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.json,.xml,.html"
                />
                <span className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-primary-700 transition-colors inline-block">
                  Choose File
                </span>
              </label>

              {selectedFile && (
                <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 inline text-green-600 mr-2" />
                  {selectedFile}
                </div>
              )}
            </div>
          </motion.div>

          {/* Manual Selection */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="text-center">
              <Cpu className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Select Components
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Manually select each component you currently have
              </p>

              <button
                onClick={() => setShowComponentSelector(!showComponentSelector)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                {showComponentSelector ? 'Hide Selector' : 'Start Selecting'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Component Selector */}
        {showComponentSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Current PC Components</h3>
            
            <div className="space-y-4">
              {componentCategories.map((category) => {
                const IconComponent = componentIcons[category];
                const key = category.toLowerCase().replace(' ', '') as keyof CurrentPC;
                const hasComponent = currentPC[key];
                
                return (
                  <div key={category} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{category}</h4>
                          {hasComponent ? (
                            <p className="text-sm text-gray-600">{hasComponent.name}</p>
                          ) : (
                            <p className="text-sm text-gray-400">Not selected</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {hasComponent ? (
                          <button
                            onClick={() => handleRemoveComponent(key)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openComponentModal(category)}
                            className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleGetRecommendations}
              disabled={Object.keys(currentPC).length === 0 || loading}
              className={`w-full mt-6 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                Object.keys(currentPC).length > 0 && !loading
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Analyzing...' : 'Get Upgrade Recommendations'}
            </button>
          </motion.div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recommended Upgrades
            </h2>

            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                {/* Compatibility Status */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-4 ${
                  rec.compatibility === 'compatible'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {rec.compatibility === 'compatible' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Safe to Upgrade</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Compatibility Issue</span>
                    </>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current Part */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="text-sm text-gray-600 font-medium mb-2">
                      Current {rec.currentPart.category}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      {rec.currentPart.name}
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(rec.currentPart.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{key}</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Part */}
                  <div className="border-2 border-primary-300 bg-primary-50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-primary-700 font-medium">
                        Recommended {rec.recommendedPart.category}
                      </div>
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        {rec.performance}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      {rec.recommendedPart.name}
                    </h4>
                    <div className="space-y-2 mb-4">
                      {Object.entries(rec.recommendedPart.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-700">{key}</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>

                    {rec.recommendedPart.easyExplanation && (
                      <div className="bg-white rounded-lg p-3 text-sm text-gray-700 mb-3">
                        <strong className="text-gray-900">Simple explanation: </strong>
                        {rec.recommendedPart.easyExplanation}
                      </div>
                    )}

                    {rec.recommendedPart.whyRecommended && (
                      <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                        <strong className="text-gray-900">Why upgrade: </strong>
                        {rec.recommendedPart.whyRecommended}
                      </div>
                    )}

                    {/* Static Price Display — no polling, pre-fetched from catalog */}
                    {rec.recommendedPart.price && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs text-green-700 font-medium mb-2">💰 Current Market Price</div>
                        <div className="text-right">
                          <p className="font-bold text-base text-gray-900 m-0">
                            ₹{rec.recommendedPart.price.toLocaleString('en-IN')}
                          </p>
                          <span className="text-xs text-gray-400 block mt-0.5">Verified price from catalog</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        Performance Improvement
                      </div>
                      <p className="text-gray-700 text-sm">{rec.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Incompatibility Warning */}
                {rec.compatibility === 'incompatible' && rec.incompatibilityReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-red-900 mb-1">
                          ⚠️ Warning: This Won't Work
                        </div>
                        <p className="text-red-700 text-sm">{rec.incompatibilityReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    disabled={rec.compatibility === 'incompatible'}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      rec.compatibility === 'compatible'
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {rec.compatibility === 'compatible' ? 'Find Shops to Buy' : 'Not Compatible'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>

        {/* Component Selection Modal */}
        {showModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="bg-primary-600 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Select {selectedCategory}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
                title="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Components List */}
            <div className="overflow-y-auto max-h-96 p-4">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No components found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredComponents.map((comp, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddComponent(selectedCategory, {
                        id: `${selectedCategory.toLowerCase()}-${index}`,
                        name: comp.name,
                        category: selectedCategory,
                        price: comp.price,
                        specs: {},
                        compatibility: [],
                        isEssential: true,
                      })}
                      className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary-700">
                            {comp.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            ₹{comp.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </>
  );
};

export default UpgradePage;
