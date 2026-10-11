import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Zap, MonitorCheck, Box, Fan } from 'lucide-react';
import type { PCBuild, PCPart } from '@/types';

interface PCVisualizerProps {
  parts: PCPart[];
  showAnimation?: boolean;
}

const PCVisualizer: React.FC<PCVisualizerProps> = ({ parts, showAnimation = true }) => {
  const [hoveredPart, setHoveredPart] = React.useState<string | null>(null);

  // Group parts by category
  const partsByCategory = React.useMemo(() => {
    const grouped: Record<string, PCPart> = {};
    parts.forEach(part => {
      grouped[part.category] = part;
    });
    return grouped;
  }, [parts]);

  // Define component positions in the PC case
  const componentPositions = {
    'Processor': { top: '25%', left: '35%', size: 'w-16 h-16' },
    'Motherboard': { top: '20%', left: '20%', size: 'w-48 h-64' },
    'RAM': { top: '15%', left: '60%', size: 'w-12 h-32' },
    'Graphics Card': { top: '50%', left: '30%', size: 'w-40 h-24' },
    'Storage': { top: '75%', left: '15%', size: 'w-20 h-16' },
    'Power Supply': { top: '80%', left: '60%', size: 'w-24 h-20' },
    'Cabinet': { top: '0', left: '0', size: 'w-full h-full' },
    'Cooler': { top: '22%', left: '32%', size: 'w-20 h-20' },
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Processor': return Cpu;
      case 'RAM': return MemoryStick;
      case 'Graphics Card': return Zap;
      case 'Storage': return HardDrive;
      case 'Power Supply': return Zap;
      case 'Cabinet': return Box;
      case 'Monitor': return MonitorCheck;
      case 'Cooler': return Fan;
      default: return Box;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Your PC Build</h3>
      
      {/* PC Case Visualization */}
      <div className="relative w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-4 border-gray-700 overflow-hidden shadow-inner">
        {/* Cabinet background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/20 to-transparent"></div>
        
        {/* Component slots */}
        <AnimatePresence>
          {Object.entries(partsByCategory).map(([category, part], index) => {
            const position = componentPositions[category as keyof typeof componentPositions];
            if (!position || category === 'Cabinet' || category === 'Monitor') return null;
            
            const Icon = getIconForCategory(category);
            const isHovered = hoveredPart === category;
            
            return (
              <motion.div
                key={category}
                initial={showAnimation ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: isHovered ? 1.1 : 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: showAnimation ? index * 0.2 : 0,
                  type: "spring",
                  stiffness: 200 
                }}
                style={{
                  position: 'absolute',
                  top: position.top,
                  left: position.left,
                }}
                className={`${position.size} cursor-pointer transform transition-transform`}
                onMouseEnter={() => setHoveredPart(category)}
                onMouseLeave={() => setHoveredPart(null)}
              >
                {/* Component card */}
                <div className={`relative w-full h-full rounded-lg border-2 transition-all ${
                  isHovered 
                    ? 'border-primary-400 bg-primary-500/30 shadow-lg shadow-primary-500/50' 
                    : 'border-gray-600 bg-gray-700/50'
                }`}>
                  {/* Component icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className={`transition-all ${
                      isHovered ? 'w-8 h-8 text-primary-300' : 'w-6 h-6 text-gray-400'
                    }`} />
                  </div>
                  
                  {/* Component image if available */}
                  {part.image && (
                    <img 
                      src={part.image} 
                      alt={part.name}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-40 hover:opacity-60 transition-opacity"
                    />
                  )}
                  
                  {/* Hover tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 border border-primary-400 rounded-lg p-3 shadow-xl z-50 min-w-max"
                    >
                      <div className="text-xs font-semibold text-primary-400 mb-1">{category}</div>
                      <div className="text-sm text-white font-medium">{part.name}</div>
                      <div className="text-xs text-gray-400 mt-1">₹{part.price.toLocaleString()}</div>
                    </motion.div>
                  )}
                </div>
                
                {/* Glowing effect for selected part */}
                {isHovered && (
                  <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur-md -z-10"></div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {Object.keys(partsByCategory).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Box className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No components selected yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Component list */}
      <div className="mt-6 space-y-2 max-h-48 overflow-y-auto">
        {parts.map((part, index) => {
          const Icon = getIconForCategory(part.category);
          
          return (
            <motion.div
              key={part.id}
              initial={showAnimation ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: showAnimation ? index * 0.1 : 0 }}
              className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-primary-500 transition-colors"
              onMouseEnter={() => setHoveredPart(part.category)}
              onMouseLeave={() => setHoveredPart(null)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  hoveredPart === part.category ? 'bg-primary-500/30' : 'bg-gray-700'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    hoveredPart === part.category ? 'text-primary-400' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{part.category}</div>
                  <div className="text-sm text-white font-medium">{part.name}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-primary-400">
                ₹{part.price.toLocaleString()}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PCVisualizer;
