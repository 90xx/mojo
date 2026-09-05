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
        // 现代泰式自然色系
        thai: {
          cream: '#F7F5F0',
          teak: '#D4A373',
          forest: '#2C5E43',
          leaf: '#4A8C6F',
          terracotta: '#E27D60',
          mango: '#E9C46A'
        }
      }
    }
  },
  plugins: [],
}