/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cyber: {
          bg: '#0a0e1a',
          card: '#111827',
          border: '#1e2d44',
          accent: '#00d4ff',
          'accent-dim': '#0099bb',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#22c55e',
          purple: '#8b5cf6',
          muted: '#64748b',
          text: '#e2e8f0',
          'text-dim': '#94a3b8',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
