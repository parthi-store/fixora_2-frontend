/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Role themes
        customer: { DEFAULT: '#3B82F6', light: '#EFF6FF', dark: '#1D4ED8' },
        manager: { DEFAULT: '#1E3A5F', light: '#EFF6FF', dark: '#0F1E35' },
        tech: { DEFAULT: '#F97316', light: '#FFF7ED', dark: '#C2410C' },
        admin: { DEFAULT: '#7C3AED', light: '#F5F3FF', dark: '#5B21B6' },
        fixora: {
          50: '#F0F4FF',
          100: '#E0EAFF',
          500: '#4F7CFF',
          600: '#3D6EFF',
          700: '#2B60FF',
          900: '#0A2540'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } }
      }
    }
  },
  plugins: []
};
