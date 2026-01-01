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
        background: {
          DEFAULT: "#121212",
          surface: "#1A1A1A",
          elevated: "#242424",
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          hover: "rgba(255, 255, 255, 0.06)",
        },
        accent: {
          yellow: "#FFFF00",
          "yellow-hover": "#E6E600",
          "yellow-muted": "#CCCC00",
        },
        text: {
          primary: "#E0E0E0",
          secondary: "#A1A1AA",
          "on-yellow": "#18181B",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.1)",
          yellow: "rgba(253, 176, 34, 0.3)",
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
