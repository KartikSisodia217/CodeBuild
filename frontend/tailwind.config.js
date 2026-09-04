/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        av: {
          bg: '#0D0F12',           // deep charcoal
          surface: '#14171C',      // primary surface
          surfaceElevated: '#171A20', // slightly elevated
          surfaceHover: '#1A1E24', // elevated/hover
          border: '#252A32',       // borders
          borderLight: '#2B3038',  // subtle borders
          textMuted: '#6B7280',    // muted text
          textSecondary: '#9AA1AD',// secondary text
          textPrimary: '#F3F4F6',  // primary text
          
          // Semantic Colors (Subtle variants)
          veto: '#EF4444',         // subtle red
          vetoBg: 'rgba(239, 68, 68, 0.1)', // subtle red bg
          pass: '#10B981',         // subtle green
          passBg: 'rgba(16, 185, 129, 0.1)', // subtle green bg
          warn: '#F59E0B',         // subtle amber
          warnBg: 'rgba(245, 158, 11, 0.1)', // subtle amber bg
          info: '#3B82F6',         // subtle blue
          infoBg: 'rgba(59, 130, 246, 0.1)', // subtle blue bg
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'float': '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
        'modal': '0 24px 32px rgba(0, 0, 0, 0.4), 0 10px 15px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
