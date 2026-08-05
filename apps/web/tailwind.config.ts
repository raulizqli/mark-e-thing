import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-sora)", "sans-serif"],
      },
      colors: {
        ink: "var(--color-ink)",
        teal: {
          DEFAULT: "var(--color-teal)",
          light: "var(--color-teal-light)",
        },
        sand: {
          DEFAULT: "var(--color-sand)",
          light: "var(--color-sand-light)",
        },
        surface: "var(--color-surface)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "fade-up-delay": "fadeUp 0.7s ease-out 0.15s forwards",
        "fade-up-delay-2": "fadeUp 0.7s ease-out 0.3s forwards",
        "underline-grow": "underlineGrow 0.8s ease-out 0.4s forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        underlineGrow: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
