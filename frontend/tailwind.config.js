/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fifa: {
          dark: '#0a0b10',
          card: '#121520',
          accent: '#00f2fe',
          gold: '#f59e0b',
          purple: '#8b5cf6',
          border: '#1e2638'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
