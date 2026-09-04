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
        },
        av: {
          bg: '#070707',           // deep nocturnal void
          surface: '#0d0e12',      // carbon surface
          surfaceElevated: '#141418', // obsidian surface
          surfaceHover: '#1c1d22', // elevated/hover
          border: '#22222a',       // borders
          borderLight: '#2e3038',  // subtle borders
          textMuted: '#60606c',    // cinder text
          textSecondary: '#a2a4a9',// slate text
          textPrimary: '#ffffff',  // crisp white text
          
          // Semantic Colors
          veto: '#F43F5E',
          vetoBg: 'rgba(244, 63, 94, 0.12)',
          pass: '#70dcd3',
          passBg: 'rgba(112, 220, 211, 0.12)',
          warn: '#f59e0b',
          warnBg: 'rgba(245, 158, 11, 0.12)',
          info: '#0092e4',
          infoBg: 'rgba(0, 146, 228, 0.12)',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.2)',
        'float': '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
        'modal': '0 24px 32px rgba(0, 0, 0, 0.6), 0 10px 15px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
