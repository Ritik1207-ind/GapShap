/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#c4d0ff',
          300: '#a1b2ff',
          400: '#7b8bff',
          500: '#5c66fa',
          600: '#4246ef',
          700: '#3535d4',
          800: '#2c2cac',
          900: '#2a2c87',
        },
        surface: {
          50:  '#f8f9fc',
          100: '#f0f2f8',
          200: '#e1e4ef',
          300: '#c7cbe0',
          400: '#9aa0bf',
          500: '#717894',
          600: '#565c77',
          700: '#444960',
          800: '#1a1d2e',
          900: '#111320',
          950: '#0a0b14',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
