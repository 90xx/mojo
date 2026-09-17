/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./app.js",
    "./verify.js",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 如果有需要自定义的 Tailwind 主题色，可以在此处扩展
      // 例如：
      // colors: {
      //   'thai-green': '#2C5E43',
      //   'thai-teak': '#D4A373',
      // }
    },
  },
  plugins: [],
}