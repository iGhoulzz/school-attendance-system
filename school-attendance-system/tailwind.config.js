/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e9eeff',
          100: '#c5d3ff',
          200: '#9eb7ff',
          300: '#779bff',
          400: '#507fff',
          500: '#2963ff', // primary brand color
          600: '#1e4ecc',
          700: '#13399a',
          800: '#0a2468',
          900: '#020f36',
        },
        secondary: {
          50: '#edfbf7',
          100: '#d3f5ea',
          200: '#a8eddc',
          300: '#7ce3cc',
          400: '#51d9bc',
          500: '#26cfac', // secondary brand color
          600: '#1ea689',
          700: '#167c67',
          800: '#0e5344',
          900: '#062922',
        },
        dark: {
          50: '#f2f2f3',
          100: '#d9dadd',
          200: '#c0c2c8',
          300: '#a7a9b3',
          400: '#8d919f',
          500: '#74798a',
          600: '#5d616e',
          700: '#464953',
          800: '#2e3138',
          900: '#17181d', // dark brand color
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
        'glass-xl': '0 16px 50px rgba(0, 0, 0, 0.15)',
        'neon': '0 0 5px rgba(41, 99, 255, 0.3), 0 0 20px rgba(41, 99, 255, 0.2)',
        'neon-lg': '0 0 10px rgba(41, 99, 255, 0.4), 0 0 30px rgba(41, 99, 255, 0.3)',
      },
      backdropFilter: {
        'blur-sm': 'blur(4px)',
        'blur': 'blur(8px)',
        'blur-md': 'blur(12px)',
        'blur-lg': 'blur(16px)',
        'blur-xl': 'blur(24px)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
    },
  },
  plugins: [],
} 