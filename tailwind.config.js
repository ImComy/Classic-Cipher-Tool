/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eef4fb', 100: '#d4e2f5', 200: '#a9c5eb', 300: '#7ea8e0', 400: '#538bd6',
          500: '#2a4b7c', 600: '#1f3a62', 700: '#152a47', 800: '#0a192d', 900: '#050d16' },
        accent: { 50: '#fdf3ed', 100: '#fbe0d0', 200: '#f6c1a1', 300: '#f0b88a', 400: '#e8996a',
          500: '#d97747', 600: '#c55f2e', 700: '#a44922', 800: '#7d3819', 900: '#562510' }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'], mono: ['Courier New', 'monospace'] }
    }
  },
  plugins: [],
}