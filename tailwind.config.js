/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0c0a08',
          dark: '#080605',
          panel: '#17100c',
          panel2: '#21140d',
          card: '#1a110c',
        },
        gold: {
          DEFAULT: '#d8a84e',
          light: '#f5d38b',
          dark: '#b9853d',
          accent: '#e9b75a',
        },
        oriental: {
          red: '#b83b27',
          cream: '#f8f0e4',
          muted: '#bcb1a3',
          line: '#49301e',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
