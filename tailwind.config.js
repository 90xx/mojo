/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./app.js",
    "./verify.js"
  ],
  theme: {
    extend: {
      colors: {
        // 现代日漫配色
        anime: {
          cream: '#F0F2F8',
          indigo: '#3B6CB5',
          navy: '#1E3A5F',
          sakura: '#F2A7B3',
          lavender: '#B8A9D4',
          slate: '#94A3B8'
        }
      }
    }
  },
  plugins: [],
}