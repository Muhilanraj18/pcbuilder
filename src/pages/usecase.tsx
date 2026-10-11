import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Code, Gamepad2, Palette, Laptop, ArrowLeft } from 'lucide-react';
import Head from 'next/head';
import ProgressBar from '@/components/ProgressBar';
import type { UseCase, UseCaseOption } from '@/types';

const UseCasePage: React.FC = () => {
  const router = useRouter();
  const { budget, monitor } = router.query;
  const [selectedUseCase, setSelectedUseCase] = React.useState<UseCase | null>(null);

  const useCaseOptions: UseCaseOption[] = [
    {
      id: 'coding',
      title: 'Coding',
      description: 'Software development and programming',
      icon: 'Code',
    },
    {
      id: 'gaming',
      title: 'Gaming',
      description: 'Smooth gaming experience',
      icon: 'Gamepad2',
      highlight: true,
    },
    {
      id: 'graphics',
      title: 'Animation/Graphics',
      description: 'Video editing and 3D work',
      icon: 'Palette',
      highlight: true,
    },
    {
      id: 'general',
      title: 'General Use',
      description: 'Everyday tasks and browsing',
      icon: 'Laptop',
    },
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      Code,
      Gamepad2,
      Palette,
      Laptop,
    };
    return icons[iconName as keyof typeof icons];
  };

  const handleContinue = () => {
    router.push({
      pathname: '/build',
      query: { budget, monitor, useCase: selectedUseCase || 'general' },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/build',
      query: { budget, monitor },
    });
  };

  return (
    <>
      <Head>
        <title>Use Case Selection | PC Builder India</title>
        <meta name="description" content="Pick gaming, coding, graphics, or general use so your PC build is optimized for your workload." />
      </Head>
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Progress Bar */}
        <ProgressBar currentStep={3} totalSteps={4} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What Will You Use It For?
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Help us recommend the best parts for your needs
          </p>
          <p className="text-sm text-gray-500">
            This step is optional — you can skip if you're not sure
          </p>
        </motion.div>

        {/* Use Case Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {useCaseOptions.map((option, index) => {
            const IconComponent = getIcon(option.icon);
            const isSelected = selectedUseCase === option.id;
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedUseCase(option.id)}
                className={`bg-white rounded-2xl p-6 cursor-pointer card-hover border-2 transition-all ${
                  isSelected
                    ? 'border-primary-600 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  option.highlight && isSelected
                    ? 'animate-glow'
                    : ''
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-primary-100'
                      : 'bg-gray-100'
                  } ${
                    option.highlight
                      ? 'ring-2 ring-primary-300 ring-opacity-50'
                      : ''
                  }`}>
                    <IconComponent className={`w-7 h-7 ${
                      isSelected
                        ? 'text-primary-600'
                        : 'text-gray-600'
                    }`} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {option.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {option.description}
                    </p>
                  </div>

                  {isSelected && (
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

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <button
            onClick={handleSkip}
            className="px-8 py-4 rounded-xl font-semibold text-lg text-gray-600 hover:text-gray-900 transition-colors"
          >
            Skip This Step
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedUseCase}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              selectedUseCase
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

export default UseCasePage;
