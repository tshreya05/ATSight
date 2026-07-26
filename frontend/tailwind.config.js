/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#060b1a",
        panel: "#0a1328",
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(34,211,238,.25), 0 10px 40px rgba(59,130,246,.15)",
      },
    },
  },
  plugins: [],
};
