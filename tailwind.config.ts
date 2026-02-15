import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2bee2b",
        "primary-dark": "#1fa81f",
        "primary-light": "#eaffea",
        "background-light": "#f6f8f6",
        "background-dark": "#102210",
        "soft-gray": "#f0f2f0",
        "text-main": "#1a2e1a",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(43, 238, 43, 0.15)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.7" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
