// Auteur : GUERRINF - Florian Guerrin
// Configuration Tailwind CSS v3

import type { Config } from 'tailwindcss'

const mConfig: Config = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Stack system-ui - zéro requête externe
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"Cascadia Code"',
          '"Fira Code"',
          '"JetBrains Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        // Palette bois / nature pour l'arbre
        wood: {
          dark: '#5a3e2b',
          mid: '#7a5430',
          light: '#8B6340',
        },
        // Palette saisons
        season: {
          spring: '#90EE90',
          'spring-bud': '#FFB7C5',
          summer: '#2d7a2d',
          'summer-alt': '#4a9e4a',
          autumn1: '#D2691E',
          autumn2: '#FF8C00',
          autumn3: '#DC143C',
          winter: '#E8F4FD',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

export default mConfig
