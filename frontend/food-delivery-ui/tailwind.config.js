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
          bg:     'rgba(255, 255, 255, 0.65)',
          border: 'rgba(255, 255, 255, 1)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '4px',
      },
      boxShadow: {
        glass: '0 4px 6px rgba(0,0,0,0.02), 0 24px 48px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
        'glass-lg': '0 8px 32px rgba(0,0,0,0.05), 0 0 80px rgba(252,128,25,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
        'brand-glow': '0 4px 24px rgba(252,128,25,0.20)',
        'brand-glow-lg': '0 8px 48px rgba(252,128,25,0.30)',
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
