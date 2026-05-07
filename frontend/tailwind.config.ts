import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#E85D2E",
          "primary-hover": "#D14E22",
          "primary-light": "#FFF0EB",
          secondary: "#2D6A4F",
          "secondary-hover": "#245A42",
          "secondary-light": "#E8F5EF",
        },
        surface: {
          bg: "#FAFAF7",
          card: "#FFFFFF",
          elevated: "#FFFFFF",
        },
        text: {
          primary: "#1A1A17",
          secondary: "#6B6B66",
          tertiary: "#9E9E99",
          inverse: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E5E5E0",
          focus: "#E85D2E",
        },
        status: {
          success: "#2D6A4F",
          "success-bg": "#E8F5EF",
          warning: "#E89B3C",
          "warning-bg": "#FFF8EB",
          danger: "#C73E3A",
          "danger-bg": "#FFF0EF",
          info: "#3A6FC7",
          "info-bg": "#EBF2FF",
        },
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans Thai",
          "Sarabun",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["22px", { lineHeight: "30px" }],
        "2xl": ["28px", { lineHeight: "36px" }],
      },
      borderRadius: {
        btn: "8px",
        card: "12px",
        modal: "16px",
      },
      spacing: {
        // 4px grid
        "0.5": "2px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
      },
      minHeight: {
        touch: "44px", // minimum touch target
      },
      minWidth: {
        touch: "44px",
      },
      animation: {
        "pulse-alert": "pulse-alert 1s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
      keyframes: {
        "pulse-alert": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7", transform: "scale(1.02)" },
        },
        "slide-up": {
          from: { transform: "translateY(16px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
