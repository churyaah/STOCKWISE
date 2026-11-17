/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mono: {
          950: '#000000', // pure black
          900: '#111111', // near black
          800: '#1e1e1e', // luxury dark
          700: '#333333', // dark grey
          600: '#555555',
          500: '#777777', // medium grey
          400: '#838282',
          300: '#b6b5b5', // muted grey
          250: '#bfbfbf',
          200: '#d9d9d9', // light grey
          150: '#e5e5e5',
          100: '#f2f2f2', // off-white background
          50: '#f9f9f9',
          0: '#ffffff',  // pure white
        }
      },
      fontFamily: {
        display: ['"Clash Display"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['"Satoshi"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.02em',
      },
      transitionTimingFunction: {
        'swiss': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
}
