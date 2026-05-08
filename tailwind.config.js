/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4c5b71',
          container: '#64748b',
          fixed: '#d3e4fe',
          fixedDim: '#b7c8e1',
        },
        secondary: {
          DEFAULT: '#5c5f60',
          container: '#e1e3e4',
          fixed: '#e1e3e4',
          fixedDim: '#c5c7c8',
        },
        tertiary: {
          DEFAULT: '#6f5636',
          container: '#8a6e4c',
          fixed: '#ffddb6',
          fixedDim: '#e3c199',
        },
        background: '#f9f9ff',
        surface: {
          DEFAULT: '#f9f9ff',
          bright: '#f9f9ff',
          container: '#e7eeff',
          containerHigh: '#dee8ff',
          containerHighest: '#d8e3fb',
          containerLow: '#f0f3ff',
          containerLowest: '#ffffff',
          dim: '#cfdaf2',
          variant: '#d8e3fb',
        },
        on: {
          background: '#111c2d',
          surface: '#111c2d',
          surfaceVariant: '#44474c',
          primary: '#ffffff',
          primaryContainer: '#f9f9ff',
          secondary: '#ffffff',
          secondaryContainer: '#626566',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '8': '8px',
      }
    },
  },
  plugins: [],
}
