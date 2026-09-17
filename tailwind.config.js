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
        // 鲜明深色主题色系
        space: {
          950: '#0b0f1a',  // 深空黑蓝（背景）
          900: '#131726',  // 深空蓝（卡片表面）
          800: '#1a1f35',  // 悬停表面
          700: '#2d3748',  // 中灰蓝
        },
        accent: {
          indigo: '#818cf8',
          violet: '#a78bfa',
          cyan: '#22d3ee',
        }
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-accent-hover': 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #22d3ee 100%)',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(99, 102, 241, 0.2), 0 4px 12px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 30px rgba(129, 140, 248, 0.15)',
        'btn': '0 2px 8px rgba(99, 102, 241, 0.3)',
        'btn-hover': '0 4px 16px rgba(99, 102, 241, 0.5)',
      }
    }
  },
  plugins: [],
}
