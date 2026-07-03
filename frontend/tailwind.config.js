/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom palette for the dark dashboard
        op: {
          bg: '#0a0e1a',
          panel: '#111827',
          panelalt: '#0f172a',
          accent: '#22d3ee',
          neon: '#22c55e',
          warn: '#f97316',
          danger: '#ef4444',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        spin360: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        slideIn: {
          from: { transform: 'translateY(-6px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'spin-slow': 'spin360 1.4s linear infinite',
        'spin-fan': 'spin360 1.2s linear infinite',
        'pulse-soft': 'pulseGlow 1.6s ease-in-out infinite',
        'slide-in': 'slideIn 220ms ease-out',
      },
    },
  },
  plugins: [],
};
