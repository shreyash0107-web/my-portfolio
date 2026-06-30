/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#12121a",
          800: "#1a1a26",
          700: "#2a2a3d",
        },
        accent: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          glow: "#a5b4fc",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
