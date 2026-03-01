/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme Colors
        darkBg: '#0F172A',
        darkCard: '#1E293B',
        darkCardHover: '#334155',
        danger: '#E53935',
        dangerHover: '#C62828',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
        textPrimary: '#FFFFFF',
        textSecondary: '#94A3B8',
        borderColor: '#334155',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
