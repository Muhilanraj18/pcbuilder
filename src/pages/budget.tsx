import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { IndianRupee, ArrowLeft } from 'lucide-react';
import Head from 'next/head';
import ProgressBar from '@/components/ProgressBar';
import type { Budget } from '@/types';

const BudgetPage: React.FC = () => {
  const router = useRouter();
  const [selectedBudget, setSelectedBudget] = React.useState<number | null>(null);
  const [customBudget, setCustomBudget] = React.useState<string>('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  const budgetOptions: { value: number; label: string; popular?: boolean; desc?: string }[] = [
    { value: 30000, label: '₹30,000', desc: 'Entry Level' },
    { value: 50000, label: '₹50,000', popular: true, desc: 'Best Value' },
    { value: 70000, label: '₹70,000', desc: 'Solid Build' },
    { value: 90000, label: '₹90,000', desc: 'Mid-Range' },
    { value: 110000, label: '₹1,10,000', desc: 'Performance' },
    { value: 130000, label: '₹1,30,000', desc: 'High-End' },
    { value: 160000, label: '₹1,60,000', desc: 'Enthusiast' },
    { value: 200000, label: '₹2,00,000', desc: 'Premium' },
  ];

  const handleCustomBudget = () => {
    const amount = parseInt(customBudget);
    if (amount >= 20000 && amount <= 1000000) {
      setSelectedBudget(amount);
      setShowCustomInput(false);
    }
  };

  const handleContinue = () => {
    if (selectedBudget) {
      router.push({
        pathname: '/monitor',
        query: { budget: selectedBudget },
      });
    }
  };

  return (
    <>
      <Head>
        <title>Select Budget | PC Builder India</title>
        <meta name="description" content="Choose your PC build budget in INR and get recommendations tailored to Indian market pricing." />
      </Head>
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Progress Bar */}
        <ProgressBar currentStep={1} totalSteps={4} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Budget
          </h1>
          <p className="text-lg text-gray-600">
            Select a budget range for your new PC build
          </p>
        </motion.div>

        {/* Budget Cards */}
        <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
          {budgetOptions.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedBudget(option.value)}
              className={`relative bg-white rounded-2xl p-8 cursor-pointer card-hover border-2 transition-all ${
                selectedBudget === option.value
                  ? 'border-primary-600 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option.popular && (
                <div className="absolute -top-3 right-6 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedBudget === option.value
                    ? 'bg-primary-100'
                    : 'bg-gray-100'
                }`}>
                  <IndianRupee className={`w-8 h-8 ${
                    selectedBudget === option.value
                      ? 'text-primary-600'
                      : 'text-gray-600'
                  }`} />
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {option.desc}
                  </p>
                </div>

                {selectedBudget === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Budget Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto mt-6 mb-8"
        >
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors font-medium"
            >
              + Enter Custom Budget
            </button>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-primary-200">
              <h3 className="font-semibold text-gray-900 mb-3">Enter Your Budget</h3>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    placeholder="Enter amount (₹20,000 - ₹10,00,000)"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    min="20000"
                    max="1000000"
                  />
                </div>
                <button
                  onClick={handleCustomBudget}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Set
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Minimum ₹20,000 • Maximum ₹10,00,000</p>
            </div>
          )}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedBudget}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              selectedBudget
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </motion.div>
        </div>
      </div>
    </>
  );
};

export default BudgetPage;
