import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep institutional navy — the primary brand colour.
        'uni-blue': {
          50: '#eef6fc',
          100: '#d9e9f6',
          200: '#b6d3e9',
          300: '#86b5d7',
          400: '#4f90be',
          500: '#2c72a3',
          600: '#1e5a87',
          700: '#15466d',
          800: '#0d3554',
          900: '#0a2a43',
          950: '#061a2b',
          DEFAULT: '#0a2a43',
        },
        // Ugandan crested-crane gold.
        'crane-yellow': {
          50: '#fffaeb',
          100: '#fef0c7',
          200: '#fedf89',
          300: '#fec84b',
          400: '#fdb022',
          500: '#f5c542',
          600: '#dc9c00',
          700: '#b47600',
          800: '#8f5a00',
          900: '#6f4400',
          dark: '#8f5a00',
          DEFAULT: '#f5c542',
        },
        'leaf-green': {
          50: '#ecfdf3',
          100: '#d1fadf',
          200: '#a6f4c5',
          300: '#6ce9a6',
          400: '#32d583',
          500: '#12b76a',
          600: '#039855',
          700: '#027a48',
          800: '#05603a',
          900: '#054f31',
          DEFAULT: '#12b76a',
        },
        ink: '#07111b',
        surface: '#f6f8fa',
        blush: '#fff5f5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(10, 42, 67, 0.04), 0 8px 24px -8px rgba(10, 42, 67, 0.12)',
        card: '0 1px 2px rgba(10, 42, 67, 0.03), 0 18px 40px -18px rgba(10, 42, 67, 0.22)',
        lift: '0 28px 60px -24px rgba(10, 42, 67, 0.35)',
        glow: '0 0 0 1px rgba(245, 197, 66, 0.4), 0 18px 50px -12px rgba(245, 197, 66, 0.45)',
        'inner-soft': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'grid-soft':
          'linear-gradient(to right, rgba(10,42,67,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,42,67,0.045) 1px, transparent 1px)',
        'mesh-brand':
          'radial-gradient(at 15% 20%, rgba(245,197,66,0.18) 0px, transparent 55%), radial-gradient(at 85% 10%, rgba(18,183,106,0.20) 0px, transparent 50%), radial-gradient(at 70% 85%, rgba(79,144,190,0.28) 0px, transparent 55%)',
        'mesh-dark':
          'radial-gradient(at 20% 0%, rgba(245,197,66,0.10) 0px, transparent 45%), radial-gradient(at 90% 15%, rgba(18,183,106,0.12) 0px, transparent 45%), radial-gradient(at 60% 100%, rgba(44,114,163,0.20) 0px, transparent 55%)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
