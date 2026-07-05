/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        swiggy: '#fc8019',
        glass: {
          bg:     'rgba(15,23,42,0.55)',
          border: 'rgba(255,255,255,0.09)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '4px',
      },
      boxShadow: {
        glass: '0 4px 6px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
        'glass-lg': '0 8px 32px rgba(0,0,0,0.5), 0 0 80px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
        'brand-glow': '0 4px 24px rgba(252,128,25,0.40)',
        'brand-glow-lg': '0 8px 48px rgba(252,128,25,0.55)',
      },
      keyframes: {
        'gradient-shift': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        }
      },
      animation: {
        'gradient-shift': 'gradient-shift 6s ease infinite',
      }
    },
  },
  plugins: [],
}
