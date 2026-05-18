/** @type {import('tailwindcss').Config} */
// SEVA SETU — Premium Luxury System (Cred + Apple inspired)
// ₹20 crore feel — sophisticated, expensive, refined

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium saffron — refined, less saturated
        primary: {
          50:  '#FBF6F1',
          100: '#F5E8DB',
          200: '#EBD0B0',
          300: '#DBA875',
          400: '#C68349',
          500: '#B16638',  // Premium burnt orange (less neon)
          600: '#94512C',
          700: '#774127',
          800: '#5E3522',
          900: '#4A2C1D',
          950: '#2B170F',
        },
        // Premium cream
        cream: {
          50:  '#FAF8F5',
          100: '#F5F1EA',
          200: '#E8DFD0',
          300: '#D4C5AC',
          400: '#B89C7A',
          500: '#9C7D5C',
        },
        // Sophisticated dark — Cred-style
        ink: {
          50:  '#FAFAF8',
          100: '#F0F0EE',
          200: '#DEDEDA',
          300: '#A8A89F',
          400: '#727268',
          500: '#4D4D44',
          600: '#363630',
          700: '#252521',
          800: '#1A1A17',
          900: '#0F0F0D',  // Premium black (not pure)
          950: '#080807',
        },
        gold: '#D4A574',
      },
      fontFamily: {
        sans:    ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', '"Plus Jakarta Sans"', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        hindi:   ['"Hind"', 'sans-serif'],
      },
      fontSize: {
        'hero':    ['64px', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '500' }],
        'display': ['44px', { lineHeight: '1.0',  letterSpacing: '-0.03em', fontWeight: '500' }],
        'title':   ['28px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '500' }],
        'subtitle':['20px', { lineHeight: '1.3',  letterSpacing: '-0.01em', fontWeight: '500' }],
      },
      boxShadow: {
        // Subtle, expensive shadows
        'soft':    '0 1px 2px rgba(15, 15, 13, 0.04), 0 1px 3px rgba(15, 15, 13, 0.06)',
        'medium':  '0 4px 6px -1px rgba(15, 15, 13, 0.06), 0 2px 4px -1px rgba(15, 15, 13, 0.04)',
        'large':   '0 20px 25px -5px rgba(15, 15, 13, 0.08), 0 10px 10px -5px rgba(15, 15, 13, 0.04)',
        'premium': '0 32px 64px -16px rgba(15, 15, 13, 0.12), 0 16px 32px -8px rgba(15, 15, 13, 0.08)',
        'glow':    '0 0 40px -8px rgba(177, 102, 56, 0.4)',
      },
      borderRadius: {
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      animation: {
        'fade-in':      'fadeIn 600ms ease',
        'fade-up':      'fadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':     'slideUp 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':      'shimmer 2.5s infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' },
        },
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(40px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'gradient-warm':    'linear-gradient(180deg, #FAF8F5 0%, #F0E6D8 100%)',
        'gradient-ink':     'linear-gradient(180deg, #1A1A17 0%, #0F0F0D 100%)',
        'gradient-premium': 'linear-gradient(180deg, #B16638 0%, #94512C 100%)',
        'gradient-gold':    'linear-gradient(135deg, #D4A574 0%, #B16638 100%)',
        'gradient-noise':   "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
