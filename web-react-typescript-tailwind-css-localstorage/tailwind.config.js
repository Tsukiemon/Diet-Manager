/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211d",
        mint: "#0f8f72",
        coral: "#d95f4d",
        amberSoft: "#f5b84b",
      },
    },
  },
  plugins: [],
};
