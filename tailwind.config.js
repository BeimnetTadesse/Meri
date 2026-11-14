/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        meri: {
          primary: 'var(--meri-primary, #16A34A)',
          primaryHover: 'var(--meri-primary-hover, #15803D)',
          secondary: 'var(--meri-secondary, #14532D)',
          bg: 'var(--meri-bg, #FFFFFF)',
          text: 'var(--meri-text, #0F172A)',
          muted: '#64748B',
          bubbleUser: '#DCFCE7',
          bubbleAssistant: '#F1F5F9',
          accent: '#10B981',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Ethiopic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
