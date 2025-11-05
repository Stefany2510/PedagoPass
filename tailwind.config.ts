
import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        primary: {
          50: "#e6f2ff",
          100: "#cce5ff",
          200: "#99ccff",
          300: "#66b2ff",
          400: "#3399ff",
          500: "#0d8bff",
          600: "#007bff",
          700: "#0062cc",
          800: "#004a99",
          900: "#003366",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(1000px 600px at 10% -10%, rgba(13,139,255,0.35), transparent), radial-gradient(1000px 600px at 90% -10%, rgba(0,123,255,0.35), transparent)",
      },
      boxShadow: {
        "soft-md":
          "0 8px 20px -8px rgb(0 0 0 / 0.12), 0 4px 10px -6px rgb(0 0 0 / 0.08)",
        "soft-lg":
          "0 12px 28px -10px rgb(0 0 0 / 0.16), 0 8px 16px -8px rgb(0 0 0 / 0.10)",
        "soft-xl":
          "0 20px 40px -15px rgb(0 0 0 / 0.18), 0 12px 24px -12px rgb(0 0 0 / 0.12)",
      },
      borderRadius: {
        lg: "var(--radius)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
