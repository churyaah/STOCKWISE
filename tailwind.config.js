/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Superdesign Technical Color Space
        ground: '#EFEFEE',
        stage: '#E4E4E2',
        ink: {
          DEFAULT: '#0D0D0F',
          secondary: '#43444A',
          muted: '#6E6F76',
        },
        signal: {
          DEFAULT: '#2F5BFF',
          lift: '#7C97FF',
        },
        hairline: {
          DEFAULT: 'rgba(13, 13, 15, 0.12)',
          dark: 'rgba(255, 255, 255, 0.12)',
        },
        // Monochromatic Grayscale mapping
        mono: {
          950: '#0D0D0F',
          900: '#141417',
          800: '#1E1E22',
          700: '#333338',
          600: '#43444A',
          500: '#6E6F76',
          400: '#8A8B92',
          300: '#B5B6BB',
          200: '#D5D5D8',
          150: '#E4E4E2',
          100: '#EFEFEE',
          50: '#F7F7F6',
          0: '#FFFFFF',
        }
      },
      fontFamily: {
        display: ['"Archivo"', 'system-ui', 'sans-serif'],
        sans: ['"Archivo"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.03em',
        wide: '+0.08em',
        wider: '+0.14em',
        widest: '+0.2em',
      },
      transitionTimingFunction: {
        'super': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseSignal: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
        traceDraw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        marqueeSlow: 'marquee 40s linear infinite',
        marqueeReverse: 'marqueeReverse 30s linear infinite',
        radar: 'radarSpin 16s linear infinite',
        pulseSignal: 'pulseSignal 2s ease-in-out infinite',
        trace: 'traceDraw 3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
