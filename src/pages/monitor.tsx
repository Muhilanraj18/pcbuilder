import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Monitor, MonitorOff, ArrowLeft } from 'lucide-react';
import Head from 'next/head';
import ProgressBar from '@/components/ProgressBar';
import type { MonitorChoice, Budget } from '@/types';

const MonitorPage: React.FC = () => {
  const router = useRouter();
  const budget = router.query.budget as string;
  const [selectedChoice, setSelectedChoice] = React.useState<MonitorChoice | null>(null);

  const monitorOptions: { value: MonitorChoice; icon: typeof Monitor; label: string; description: string }[] = [
    {
      value: 'with',
      icon: Monitor,
      label: 'With Monitor',
      description: 'Include monitor in your build',
    },
    {
      value: 'without',
      icon: MonitorOff,
      label: 'Without Monitor',
      description: 'I already have a monitor',
    },
  ];

  const handleContinue = () => {
    if (selectedChoice) {
      router.push({
        pathname: '/usecase',
        query: { budget, monitor: selectedChoice },
      });
    }
  };

  return (
    <>
      <Head>
        <title>Monitor Selection | PC Builder India</title>
        <meta name="description" content="Choose whether to include a monitor in your PC build budget before generating recommendations." />
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
        <ProgressBar currentStep={2} totalSteps={4} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Do You Need a Monitor?
          </h1>
          <p className="text-lg text-gray-600">
            Let us know if you want to include a monitor in your budget
          </p>
        </motion.div>

        {/* Monitor Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          {monitorOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedChoice(option.value)}
                className={`bg-white rounded-2xl p-8 cursor-pointer card-hover border-2 transition-all ${
                  selectedChoice === option.value
                    ? 'border-primary-600 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedChoice === option.value
                      ? 'bg-primary-100'
                      : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-8 h-8 ${
                      selectedChoice === option.value
                        ? 'text-primary-600'
                        : 'text-gray-600'
                    }`} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>

                  {selectedChoice === option.value && (
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
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedChoice}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              selectedChoice
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

export default MonitorPage;
