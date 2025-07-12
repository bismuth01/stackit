/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure this matches your folder structure
  ],
  darkMode: 'class', // Enable dark mode via class (or use 'media' for OS-based)
  theme: {
    extend: {
      fontFamily: {
        futuristic: ['Orbitron', 'sans-serif'], // 👈 Custom font
      },
      colors: {
        background: '#1e1a2e',
        surface: '#2e294e',
        accent: '#5c4f6e',
        highlight: '#b3a8c9',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
