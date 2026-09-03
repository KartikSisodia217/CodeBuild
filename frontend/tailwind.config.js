/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        gate: {
          bg: '#090D14',
          surface: '#0E131F',
          card: '#131926',
          cardHover: '#182030',
          border: '#1F293D',
          borderLight: '#2D3A54',
          textMuted: '#6B7A94',
          textSecondary: '#94A3B8',
          textPrimary: '#F1F5F9',
          veto: '#EF4444',
          pass: '#10B981',
          warn: '#F59E0B',
          accent: '#6366F1',
        }
      }
    },
  },
  plugins: [],
}
