import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  subtitle?: string;
  className?: string;
  markOnly?: boolean;
}

const sizes = {
  sm: { box: 'h-9 w-9 rounded-xl', text: 'text-[15px]', sub: 'text-[7px]', icon: 20 },
  md: { box: 'h-11 w-11 rounded-2xl', text: 'text-lg', sub: 'text-[8px]', icon: 25 },
  lg: { box: 'h-14 w-14 rounded-[18px]', text: 'text-2xl', sub: 'text-[9px]', icon: 32 },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  subtitle,
  className = '',
  markOnly = false,
}) => {
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-uni-blue-700 via-uni-blue-900 to-uni-blue-950 text-crane-yellow shadow-[0_10px_24px_-10px_rgba(10,42,67,0.8)] ring-1 ring-white/10 ${s.box}`}
      >
        <span className="pointer-events-none absolute -right-3 -top-3 h-7 w-7 rounded-full bg-crane-yellow/20 blur-md" />
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2.8 19.5 6v5.3c0 4.9-3.2 8.3-7.5 9.7-4.3-1.4-7.5-4.8-7.5-9.7V6L12 2.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="m8.9 11.8 2.2 2.2 4.2-4.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!markOnly && (
        <div className="min-w-0">
          <p
            className={`font-display font-extrabold leading-none tracking-tight ${s.text} ${
              variant === 'dark' ? 'text-white' : 'text-uni-blue'
            }`}
          >
            Soma<span className="text-crane-yellow-600">Agent</span>
          </p>
          <p
            className={`mt-1 font-semibold uppercase tracking-[0.22em] ${s.sub} ${
              variant === 'dark' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {subtitle || 'Uganda · NCDC'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
