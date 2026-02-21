import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7ff",
          500: "#1e40af",
          700: "#1e3a8a"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
