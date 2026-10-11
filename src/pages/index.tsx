import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Monitor, Cpu, ArrowRight } from 'lucide-react';
import Head from 'next/head';

const LandingPage: React.FC = () => {
  const router = useRouter();

  const handleSelection = (type: 'build' | 'upgrade') => {
    if (type === 'build') {
      router.push('/budget');
    } else {
      router.push('/upgrade');
    }
  };

  return (
    <>
      <Head>
        <title>PC Builder India - Build & Upgrade PCs</title>
        <meta name="description" content="Create the best PC build under your budget in India with compatibility-safe recommendations and live price checks." />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            PC Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build your perfect PC or upgrade your existing setup with expert recommendations
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Build New PC Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => handleSelection('build')}
            className="bg-white rounded-2xl p-8 shadow-lg cursor-pointer card-hover group"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Cpu className="w-10 h-10 text-primary-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Build New PC
                </h2>
                <p className="text-gray-600">
                  Start fresh with a complete PC build tailored to your budget and needs
                </p>
              </div>

              <div className="flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform">
                <span>Get Started</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </motion.div>

          {/* Upgrade My PC Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => handleSelection('upgrade')}
            className="bg-white rounded-2xl p-8 shadow-lg cursor-pointer card-hover group"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Monitor className="w-10 h-10 text-emerald-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upgrade My PC
                </h2>
                <p className="text-gray-600">
                  Get safe, compatible upgrade recommendations for your current setup
                </p>
              </div>

              <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform">
                <span>Get Started</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>100% Compatible Parts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Best Prices in India</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Expert Recommendations</span>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
