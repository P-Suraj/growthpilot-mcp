/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#030712",
        panel: "rgba(17, 24, 39, 0.7)",
        border: "rgba(255, 255, 255, 0.08)",
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "grid-fade": "grid-fade 10s linear infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s infinite linear",
      },
      keyframes: {
        "grid-fade": {
          "0%, 100%": { opacity: 0.15 },
          "50%": { opacity: 0.35 },
        },
        "pulse-glow": {
          "0%, 100%": { transform: "scale(1)", filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.2))" },
          "50%": { transform: "scale(1.02)", filter: "drop-shadow(0 0 25px rgba(139, 92, 246, 0.55))" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}
