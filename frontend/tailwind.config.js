/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Outfit', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg:      '#1a1a2e',
        deep:    '#12121f',
        raised:  '#22223a',
        iris: {
          violet: '#a78bfa',
          indigo: '#818cf8',
          sky:    '#38bdf8',
          pink:   '#f472b6',
          emerald:'#34d399',
        },
        text: {
          DEFAULT: '#e2e0ff',
          muted:   '#8b8aad',
        }
      },
    },
  },
  plugins: [],
}