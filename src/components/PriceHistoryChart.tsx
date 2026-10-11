import React, { useMemo, useState } from 'react';
import type { PriceHistoryPoint } from '@/types';

interface PriceHistoryChartProps {
  productName: string;
  currentPrice: number;
  releaseYear?: number;
}

// Generate realistic 5-year price history based on product type and release year
function generatePriceHistory(name: string, currentPrice: number, releaseYear: number): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 5, now.getMonth(), 1);

  const isGPU = /rtx|gtx|radeon|rx/i.test(name);
  const isCPU = /ryzen|intel|core i/i.test(name);
  const isRAM = /ddr4|ddr5|ram/i.test(name);
  const isStorage = /ssd|nvme|hdd/i.test(name);

  // Launch price multiplier (products start expensive and decrease)
  const launchMultiplier = isGPU ? 1.4 : isCPU ? 1.25 : isRAM ? 1.6 : isStorage ? 1.8 : 1.3;
  const launchPrice = Math.round(currentPrice * launchMultiplier);

  for (let i = 0; i <= 60; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    if (date > now) break;

    const progress = i / 60; // 0 to 1 over 5 years
    let price: number;

    // Base depreciation curve
    const depreciation = 1 - (1 - currentPrice / launchPrice) * Math.pow(progress, 0.7);
    price = launchPrice * depreciation;

    // GPU shortage spike (2021-2022 period)
    if (isGPU) {
      const year = date.getFullYear();
      const month = date.getMonth();
      if ((year === 2021 && month >= 3) || (year === 2022 && month <= 6)) {
        const shrtgProgress = year === 2021 ? (month - 3) / 9 : (year === 2022 ? 1 - month / 6 : 0);
        price *= 1 + 0.6 * Math.sin(shrtgProgress * Math.PI);
      }
    }

    // DDR5 early adoption premium
    if (isRAM && name.includes('DDR5')) {
      const year = date.getFullYear();
      if (year <= 2022) {
        price *= 1.5;
      } else if (year === 2023) {
        price *= 1.2;
      }
    }

    // Seasonal sales dips (Diwali Oct-Nov, Republic Day Jan)
    const month = date.getMonth();
    if (month === 9 || month === 10) price *= 0.92; // Diwali
    if (month === 0) price *= 0.95; // Republic Day

    // Add small random noise
    const noise = 1 + (Math.sin(i * 7.3) * 0.03);
    price *= noise;

    points.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price),
      source: month === 9 || month === 10 ? 'Diwali Sale' : undefined,
    });
  }

  return points;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  productName,
  currentPrice,
  releaseYear = 2022,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PriceHistoryPoint | null>(null);
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y'>('5Y');

  const allHistory = useMemo(
    () => generatePriceHistory(productName, currentPrice, releaseYear),
    [productName, currentPrice, releaseYear]
  );

  const history = useMemo(() => {
    const months = timeRange === '1Y' ? 12 : timeRange === '3Y' ? 36 : 60;
    return allHistory.slice(-months);
  }, [allHistory, timeRange]);

  if (history.length < 2) return null;

  const prices = history.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Chart dimensions
  const W = 700, H = 280, PAD_L = 60, PAD_R = 20, PAD_T = 20, PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const toX = (i: number) => PAD_L + (i / (history.length - 1)) * chartW;
  const toY = (price: number) => PAD_T + (1 - (price - minPrice) / priceRange) * chartH;

  const linePath = history.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.price)}`).join(' ');
  const areaPath = `${linePath} L ${toX(history.length - 1)} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`;

  // Price change stats
  const firstPrice = history[0].price;
  const lastPrice = history[history.length - 1].price;
  const changePercent = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(1);
  const isDown = lastPrice < firstPrice;
  const lowestPoint = history.reduce((low, p) => p.price < low.price ? p : low, history[0]);
  const highestPoint = history.reduce((high, p) => p.price > high.price ? p : high, history[0]);

  // Y-axis labels
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const price = minPrice + (priceRange * i) / 4;
    return { price: Math.round(price), y: toY(price) };
  });

  // X-axis labels (show ~6 date labels)
  const step = Math.max(1, Math.floor(history.length / 6));
  const xLabels = history.filter((_, i) => i % step === 0 || i === history.length - 1).map((p, _, arr) => {
    const idx = history.indexOf(p);
    const d = new Date(p.date);
    return { label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), x: toX(idx) };
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Price History</h3>
          <p className="text-sm text-gray-500">Estimated trend over {timeRange === '1Y' ? '1 year' : timeRange === '3Y' ? '3 years' : '5 years'}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['1Y', '3Y', '5Y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeRange === r ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Current</div>
          <div className="text-sm font-bold text-gray-900">₹{currentPrice.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Change</div>
          <div className={`text-sm font-bold ${isDown ? 'text-green-600' : 'text-red-600'}`}>
            {isDown ? '↓' : '↑'} {Math.abs(Number(changePercent))}%
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Lowest</div>
          <div className="text-sm font-bold text-green-700">₹{lowestPoint.price.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Highest</div>
          <div className="text-sm font-bold text-red-700">₹{highestPoint.price.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minHeight: 220 }}>
          {/* Grid lines */}
          {yLabels.map((yl, i) => (
            <g key={i}>
              <line x1={PAD_L} y1={yl.y} x2={W - PAD_R} y2={yl.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD_L - 8} y={yl.y + 4} textAnchor="end" className="text-[10px]" fill="#9ca3af">
                ₹{(yl.price / 1000).toFixed(0)}k
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map((xl, i) => (
            <text key={i} x={xl.x} y={H - 8} textAnchor="middle" className="text-[10px]" fill="#9ca3af">
              {xl.label}
            </text>
          ))}

          {/* Gradient area fill */}
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDown ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isDown ? '#10b981' : '#ef4444'} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#priceGradient)" />
          <path d={linePath} fill="none" stroke={isDown ? '#10b981' : '#ef4444'} strokeWidth="2.5" strokeLinejoin="round" />

          {/* Hover interaction areas */}
          {history.map((point, i) => (
            <g key={i}>
              <circle
                cx={toX(i)} cy={toY(point.price)} r={hoveredPoint === point ? 5 : 0}
                fill={isDown ? '#10b981' : '#ef4444'} stroke="white" strokeWidth="2"
              />
              <rect
                x={toX(i) - chartW / history.length / 2} y={PAD_T}
                width={chartW / history.length} height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'crosshair' }}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10"
            style={{
              left: `${((toX(history.indexOf(hoveredPoint))) / W) * 100}%`,
              top: `${((toY(hoveredPoint.price)) / H) * 100 - 15}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold">₹{hoveredPoint.price.toLocaleString('en-IN')}</div>
            <div className="text-gray-300">{new Date(hoveredPoint.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
            {hoveredPoint.source && <div className="text-yellow-300 text-[10px]">🏷 {hoveredPoint.source}</div>}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        * Price trends are estimated based on historical market patterns. Actual prices may vary.
      </p>
    </div>
  );
};

export default PriceHistoryChart;
