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
        // 现代深色玻璃拟态主题色系
        space: {
          900: '#0a0e1a',  // 深空黑蓝
          800: '#111827',  // 深空蓝
          700: '#1f2937',  // 中灰蓝
        },
        accent: {
          indigo: '#6366f1',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
        }
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-accent-hover': 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #22d3ee 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 40px rgba(99, 102, 241, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 30px rgba(99, 102, 241, 0.15)',
      }
    }
  },
  plugins: [],
}
