import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#D90000', dark: '#8B0000', deep: '#5c0000', light: '#ff3b30' },
        gold: { DEFAULT: '#FFC400', dark: '#e0a800' },
        ink: { DEFAULT: '#111111', soft: '#2a2a2a' },
        cream: '#FFF6E5',
        leaf: '#3fa535',
        wa: { DEFAULT: '#25D366', dark: '#1da851' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'Arial Narrow', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px -8px rgba(0,0,0,.25)',
        pop: '0 14px 34px -10px rgba(217,0,0,.55)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'none' } },
        'slide-in': { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'none' } },
        'slide-in-left': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'none' } },
        'pop': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.25)' }, '100%': { transform: 'scale(1)' } },
        'float': { '0%,100%': { transform: 'translateY(0) rotate(-2deg)' }, '50%': { transform: 'translateY(-10px) rotate(2deg)' } },
        'marquee': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'shimmer': { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-up': 'fade-up .5s ease-out both',
        'slide-in': 'slide-in .3s ease-out both',
        'slide-in-left': 'slide-in-left .3s ease-out both',
        'pop': 'pop .35s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
