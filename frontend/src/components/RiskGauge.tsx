import React from 'react';

interface RiskGaugeProps {
  score: number;
  riskLevel: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, riskLevel }) => {
  // Normalize score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Circumference for r = 50 arc
  const radius = 50;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Half circle arc (180 deg)
  const strokeDashoffset = circumference - (normalizedScore / 100) * (circumference / 2);

  const getScoreColor = (s: number) => {
    if (s >= 80) return { text: 'text-emerald-400', stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (s >= 60) return { text: 'text-amber-400', stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    return { text: 'text-rose-500', stroke: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' };
  };

  const colors = getScoreColor(normalizedScore);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden">
        <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Arc */}
          <circle
            cx="50"
            cy="50"
            r={normalizedRadius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference / 2} ${circumference}`}
          />
          {/* Animated Value Arc */}
          <circle
            cx="50"
            cy="50"
            r={normalizedRadius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference / 2} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute top-8 flex flex-col items-center">
          <span className={`text-3xl font-extrabold tracking-tight ${colors.text}`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Health Index
          </span>
        </div>
      </div>

      <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold border border-slate-700/50 ${colors.text}`}>
        {riskLevel}
      </div>
    </div>
  );
};
