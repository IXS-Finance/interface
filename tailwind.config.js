/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Map your existing theme colors to CSS custom properties
        // These will be set dynamically based on your theme system
        'primary': 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        'bg-0': 'var(--color-bg-0)',
        'bg-1': 'var(--color-bg-1)',
        'bg-2': 'var(--color-bg-2)',
        'bg-3': 'var(--color-bg-3)',
        'bg-4': 'var(--color-bg-4)',
        'bg-5': 'var(--color-bg-5)',
        'text-1': 'var(--color-text-1)',
        'text-2': 'var(--color-text-2)',
        'text-3': 'var(--color-text-3)',
        'text-4': 'var(--color-text-4)',
        'text-5': 'var(--color-text-5)',
        'text-6': 'var(--color-text-6)',
        'red-1': 'var(--color-red-1)',
        'red-2': 'var(--color-red-2)',
        'red-3': 'var(--color-red-3)',
        'green-1': 'var(--color-green-1)',
        'yellow-1': 'var(--color-yellow-1)',
        'yellow-2': 'var(--color-yellow-2)',
        'blue-1': 'var(--color-blue-1)',
        'error': 'var(--color-error)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',

        // New design system colors from Figma
        'dark': {
          100: '#141419',  // Sidebar background
          200: '#16171C',  // Main background
          300: '#222328',  // Border/secondary elements
        },
        'light': {
          100: '#FFFFFF',  // Pure white
          200: 'rgba(255, 255, 255, 0.9)',  // High opacity white
          300: 'rgba(255, 255, 255, 0.6)',  // Medium opacity white
          400: 'rgba(255, 255, 255, 0.3)',  // Low opacity white
        },
        'gray': {
          100: '#F8F9FA',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#222328',
        },
      },
      screens: {
        // Match your existing breakpoints
        'xs': '370px',
        'sm': '720px',
        'md': '960px',
        'lg': '1280px',
        'upToExtraSmall': {'max': '500px'},
        'upToSmall': {'max': '720px'},
        'upToMedium': {'max': '960px'},
        'upToLarge': {'max': '1280px'},
      },
      spacing: {
        // Add common spacing values from your design system
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '20': '20px',
        '30': '30px',
        '32': '32px', // From design system
        '50': '50px', // For buttons
        '100': '100px', // For pills/nav items
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      fontSize: {
        '10': '10px',
        '11': '11px',
        '13': '13px',
        '15': '15px',
        '16': '16px',
        '18': '18px',
        '22': '22px',
        '28': '28px',
        '40': '40px',
      },
      boxShadow: {
        'custom': '0px 6px 10px rgba(0, 0, 0, 0.2)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  // Important: Use important strategy to override styled-components when needed
  important: true,
}
