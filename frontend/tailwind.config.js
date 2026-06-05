/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#0d1117',
          900: '#111827',
          800: '#161d2e',
          700: '#1c2541',
          600: '#223060',
          card: '#1a2236',
          sidebar: '#131929',
        },
        blue: {
          accent: '#4b7cf3',
          soft: '#3a6be0',
          glow: 'rgba(75, 124, 243, 0.18)',
        },
        orange: {
          accent: '#f97316',
          soft: '#ea6c0a',
          glow: 'rgba(249, 115, 22, 0.18)',
        },
        slate: {
          text: '#a3b0cc',
          muted: '#6b7a99',
          border: 'rgba(255,255,255,0.07)',
        }
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.3)',
        blue: '0 4px 20px rgba(75, 124, 243, 0.3)',
        orange: '0 4px 20px rgba(249, 115, 22, 0.3)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}