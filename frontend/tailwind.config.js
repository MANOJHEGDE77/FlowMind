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
        background: '#08090D',
        surface: {
          DEFAULT: '#0F1118',
          elevated: '#151823',
          hover: '#1A1E2B',
        },
        foreground: {
          DEFAULT: '#F4F5F7',
          secondary: '#A7ACB8',
          muted: '#686E7C',
        },
        primary: {
          DEFAULT: '#7C5CFF',
          soft: '#9B84FF',
        },
        flow: {
          DEFAULT: '#5EE7FF',
          soft: '#2BB9D6',
        },
        success: '#45E0A8',
        warning: '#F5B84B',
        error: '#FF5C6C',
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.16)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
