import React, { useState } from 'react';
import { DailyProjection } from '../types';

interface GrowthChartProps {
  projections: DailyProjection[];
  startingAmount: number;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ projections, startingAmount }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!projections || projections.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        Enter starting balance and duration to view hypothetical trajectory chart.
      </div>
    );
  }

  // Prepend day 0 (starting amount)
  const dataPoints = [
    { day: 0, endingBalance: startingAmount, dateStr: 'Day 0', dailyGain: 0 },
    ...projections,
  ];

  const maxVal = Math.max(...dataPoints.map((d) => d.endingBalance));
  const minVal = Math.min(...dataPoints.map((d) => d.endingBalance));

  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (dataPoints.length - 1)) * innerW;
  const getY = (val: number) => {
    if (maxVal === minVal) return height / 2;
    return height - paddingY - ((val - minVal) / (maxVal - minVal)) * innerH;
  };

  // Generate SVG path for line
  const points = dataPoints.map((d, i) => `${getX(i)},${getY(d.endingBalance)}`).join(' ');
  const areaPoints = `${getX(0)},${height - paddingY} ${points} ${getX(dataPoints.length - 1)},${height - paddingY}`;

  const activePoint = hoveredIndex !== null ? dataPoints[hoveredIndex] : dataPoints[dataPoints.length - 1];

  return (
    <div className="space-y-4">
      {/* Top Readout */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <div className="text-xs text-slate-400">
            {hoveredIndex !== null ? `Hypothetical Day ${activePoint.day} Projection` : 'Simulated 30% Growth Curve'}
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
            GH₵{activePoint.endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Starting Base:</span>
            <span className="text-slate-300 font-semibold">GH₵{startingAmount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Daily Compound:</span>
            <span className="text-amber-400 font-semibold">+30% / Day</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0b1528" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + ratio * innerH;
            const val = maxVal - ratio * (maxVal - minVal);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-500 font-mono"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#growthGradient)" />

          {/* Line stroke */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {dataPoints.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.endingBalance);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3.5}
                  className={`${
                    isHovered
                      ? 'fill-amber-400 stroke-white stroke-2'
                      : 'fill-emerald-400 stroke-slate-900 stroke-2'
                  } transition-all cursor-pointer`}
                  onMouseEnter={() => setHoveredIndex(i)}
                />
                {/* Invisible hit target for easy touch/hover */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={16}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-2">
        <span>Day 0 (Initial)</span>
        <span>Formula: New = Previous × 1.30</span>
        <span>Day {projections[projections.length - 1]?.day} (End)</span>
      </div>
    </div>
  );
};
