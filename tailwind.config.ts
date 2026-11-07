import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Khmer',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        khmer: ['Noto Sans Khmer', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        accent: {
          50:  '#f0eeff',
          100: '#e1ddff',
          200: '#c3bcff',
          300: '#a59aff',
          400: '#8779ff',
          500: '#6C63FF', // primary
          600: '#5a52d5',
          700: '#4840ab',
          800: '#362f81',
          900: '#241f57',
        },
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
} satisfies Config
