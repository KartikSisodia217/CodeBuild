/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        harness: {
          void: '#070707',
          carbon: '#0d0e12',
          obsidian: '#141418',
          steel: '#22222a',
          iron: '#2e3038',
          fog: '#d9dae5',
          ash: '#c8cad0',
          graphite: '#aeaeb7',
          slate: '#a2a4a9',
          cinder: '#60606c',
          mint: '#70dcd3',
          signal: '#0092e4',
          verdant: '#75ae4c',
          veto: '#F43F5E',
        }
      }
    },
  },
  plugins: [],
}
