/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        cosmic: {
          950: '#030010',
          900: '#0a0020',
          800: '#0f0a2e',
          700: '#1a1045',
          600: '#251a5e'
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #030010 0%, #0a0020 30%, #0f0a2e 60%, #1a0535 100%)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        'btn-gradient': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #db2777 100%)',
        'btn-gradient-hover': 'linear-gradient(135deg, #6d28d9 0%, #9333ea 50%, #be185d 100%)',
        'progress-gradient': 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)'
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'spin-slow': 'spin 20s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' }
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(168,85,247,0.3), 0 0 20px rgba(168,85,247,0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3), 0 0 60px rgba(236,72,153,0.2)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
