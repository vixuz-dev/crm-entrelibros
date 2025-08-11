/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {

        // Variantes específicas de Cabin
        'cabin-regular': ['cabin-regular', 'sans-serif'],
        'cabin-medium': ['cabin-medium', 'sans-serif'],
        'cabin-semibold': ['cabin-semibold', 'sans-serif'],
        'cabin-bold': ['cabin-bold', 'sans-serif'],
        'cabin-italic': ['cabin-italic', 'sans-serif'],
        'cabin-medium-italic': ['cabin-medium-italic', 'sans-serif'],
        'cabin-semibold-italic': ['cabin-semibold-italic', 'sans-serif'],
        'cabin-bold-italic': ['cabin-bold-italic', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#F9F5F1',
          100: '#F5F0EB',
          200: '#E5E0DB',
          500: '#C79E7E',
          600: '#A67C52',
          700: '#8B6B4A',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
        }
      }
    },
  },
  plugins: [],
}

