/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tricolor accents
        saffron: '#FF9933',
        'saffron-light': '#FFB366',
        'saffron-dark': '#E68A2E',
        green: '#138808',
        'green-light': '#16A30A',
        'green-dark': '#0F6906',
        
        // Light mode
        light: {
          background: '#F9FAFB',
          foreground: '#0A0A0A',
          muted: '#F5F5F5',
          'muted-foreground': '#737373',
          border: '#E5E5E5',
          accent: '#F5F5F5',
          'accent-foreground': '#0A0A0A',
        },
        
        // Dark mode
        dark: {
          background: '#0A0A0A',
          foreground: '#FAFAFA',
          muted: '#1A1A1A',
          'muted-foreground': '#A3A3A3',
          border: '#262626',
          accent: '#1A1A1A',
          'accent-foreground': '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
