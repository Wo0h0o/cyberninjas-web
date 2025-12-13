/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#09090B",
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          hover: "rgba(255, 255, 255, 0.06)",
        },
        accent: {
          purple: "#8B5CF6",
          violet: "#A855F7",
          fuchsia: "#C026D3",
        },
      },
      animation: {
        "aurora-pulse": "aurora-pulse 8s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
      },
      keyframes: {
        "aurora-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)" },
          "50%": { boxShadow: "0 0 50px rgba(139, 92, 246, 0.6)" },
        },
      },
    },
  },
  plugins: [],
}
