/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          textLight: "#1A1A1A",
        },
      },
    },
    plugins: [],
    future: {
      hoverOnlyWhenSupported: false
    }
  };