'use client';

import React, { useId } from 'react';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trailColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
  showValue?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 96,
  strokeWidth = 8,
  color = '#0a2a43',
  trailColor = '#eef2f6',
  label,
  sublabel,
  className = '',
  showValue = true,
}) => {
  const id = useId().replace(/:/g, '');
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = Radius(radius);
  const dash = (clamped / 100) * circumference;

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trailColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-all duration-1000 ease-spring"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-extrabold tracking-tight text-uni-blue" style={{ fontSize: size * 0.23 }}>
            {label ?? `${Math.round(clamped)}%`}
          </span>
          {sublabel && (
            <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

function Radius(r: number) {
  return 2 * Math.PI * r;
}

export default ProgressRing;
