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
      colors: {
        // 暖绿主题扩展色（可选，供 Tailwind 类名直接使用）
        'warm-green': {
          50: '#F4F7F2',
          100: '#E8F0E4',
          200: '#D6E4D0',
          300: '#A8C69F',
          400: '#8BB68A',
          500: '#5B9A6F',
          600: '#4A8C6F',
          700: '#3A6B4A',
          800: '#2D5A3D',
          900: '#1B4332',
        }
      }
    },
  },
  plugins: [],
}