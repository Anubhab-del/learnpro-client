/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07080f',
          900: '#0c0e1a',
          800: '#111426',
          700: '#181c32',
          600: '#1f2440',
        },
        violet: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#2e1065',
        },
        amber: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      opacity: {
        '3':  '0.03',
        '6':  '0.06',
        '7':  '0.07',
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
        '35': '0.35',
        '45': '0.45',
        '55': '0.55',
        '65': '0.65',
        '85': '0.85',
      },
      backgroundOpacity: {
        '3':  '0.03',
        '6':  '0.06',
        '7':  '0.07',
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
        '35': '0.35',
        '45': '0.45',
        '55': '0.55',
        '65': '0.65',
        '85': '0.85',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-up':      'fadeUp 0.6s ease both',
        'fade-in':      'fadeIn 0.4s ease both',
        'scale-in':     'scaleIn 0.3s ease both',
        'slide-right':  'slideRight 0.4s ease both',
        'spin-slow':    'spin 8s linear infinite',
        'pulse-soft':   'pulseSoft 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 9s ease-in-out infinite',
        'bounce-dot':   'bounceDot 1.2s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'scan-line':    'scanLine 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.9' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%':           { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139,92,246,0.3)' },
          '50%':      { boxShadow: '0 0 50px rgba(139,92,246,0.7), 0 0 80px rgba(139,92,246,0.3)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      boxShadow: {
        'violet-sm':  '0 0 12px rgba(139,92,246,0.25)',
        'violet-md':  '0 0 30px rgba(139,92,246,0.40)',
        'violet-lg':  '0 0 60px rgba(139,92,246,0.30)',
        'violet-xl':  '0 0 100px rgba(139,92,246,0.25)',
        'amber-sm':   '0 0 12px rgba(245,158,11,0.20)',
        'amber-md':   '0 0 30px rgba(245,158,11,0.30)',
        'emerald-sm': '0 0 12px rgba(52,211,153,0.25)',
        'card':       '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        'player':     '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}