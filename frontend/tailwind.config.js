/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0a0a0f',
          soft: '#12121a',
          muted: '#1e1e2e',
        },
        frost: {
          DEFAULT: '#e8eaf6',
          soft: '#f5f5ff',
        },
        volt: {
          DEFAULT: '#c5f135',
          dark: '#a8d420',
          glow: 'rgba(197, 241, 53, 0.15)',
        },
        slate: {
          chip: '#2a2a3e',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-volt': 'pulseVolt 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseVolt: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(197, 241, 53, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(197, 241, 53, 0)' },
        }
      }
    },
  },
  plugins: [],
}