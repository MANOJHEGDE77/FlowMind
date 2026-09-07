/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#07090E',
          900: '#0B0F17',
          850: '#111723',
          800: '#171F2F',
          700: '#232E42',
          600: '#34425B',
          500: '#4B5E7E',
        },
        brand: {
          primary: '#38BDF8',
          accent: '#0284C7',
          glow: '#0EA5E9',
        },
        agent: {
          analyst: '#38BDF8',
          optimist: '#34D399',
          skeptic: '#F87171',
          financial: '#FBBF24',
          longterm: '#818CF8',
          devil: '#FB7185',
          synthesizer: '#C084FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle-node': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'active-node': '0 0 25px -4px rgba(56, 189, 248, 0.25), 0 0 0 1px rgba(56, 189, 248, 0.5)',
        'modal-depth': '0 20px 45px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
