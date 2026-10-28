'use client';

import React from 'react';
import Icon, { IconName } from './Icon';

const tones: Record<string, { icon: string; bar: string }> = {
  blue: { icon: 'bg-uni-blue/10 text-uni-blue', bar: 'bg-uni-blue' },
  gold: { icon: 'bg-crane-yellow/20 text-crane-yellow-800', bar: 'bg-crane-yellow' },
  green: { icon: 'bg-leaf-green/10 text-leaf-green-700', bar: 'bg-leaf-green' },
  violet: { icon: 'bg-violet-100 text-violet-600', bar: 'bg-violet-500' },
  rose: { icon: 'bg-rose-100 text-rose-600', bar: 'bg-rose-500' },
};

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: IconName;
  tone?: keyof typeof tones;
  progress?: number;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon,
  tone = 'blue',
  progress,
  trend,
}) => {
  const t = tones[tone] ?? tones.blue;

  return (
    <div className="card group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">{label}</p>
          <p className="mt-2 font-display text-[26px] font-extrabold leading-none tracking-tight text-uni-blue">
            {value}
          </p>
          {hint && <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-400">{hint}</p>}
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.icon}`}>
          <Icon name={icon} size={19} />
        </div>
      </div>

      {typeof progress === 'number' && (
        <div className="mt-4 flex items-center gap-2.5">
          <div className="progress-track h-1.5 flex-1">
            <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-400">{Math.round(progress)}%</span>
        </div>
      )}

      {trend && (
        <p className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-leaf-green-700">
          <Icon name="trending-up" size={12} />
          {trend}
        </p>
      )}
    </div>
  );
};

export default StatCard;
