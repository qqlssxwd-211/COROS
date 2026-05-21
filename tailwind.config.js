/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Neue Haas Grotesk Display Pro 55 Roman"', 'Helvetica Neue', 'sans-serif'],
        text: ['"Neue Haas Grotesk Text Pro"', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        accent: { DEFAULT: '#4ade80', hover: '#22c55e' },
      },
    },
  },
  plugins: [],
};
