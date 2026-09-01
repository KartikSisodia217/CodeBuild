/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F17',
          surface: '#121824',
          card: '#1B2436',
          border: '#2A364F',
          primary: '#3B82F6',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          accent: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}
