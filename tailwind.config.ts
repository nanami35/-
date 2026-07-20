import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ABENGERS KNOWLEDGE OS ブランドカラー
        navy: {
          DEFAULT: "#1A2B4A",
          50: "#F0F3F8",
          100: "#D6DEEB",
          600: "#25406B",
          700: "#1A2B4A",
          800: "#132039",
          900: "#0C1526",
        },
        gold: {
          DEFAULT: "#C9A227",
          soft: "#E7D9A0",
          dark: "#A6841A",
        },
        canvas: "#F7F8FA",
        card: "#FFFFFF",
        ink: "#1F2937",
        muted: "#6B7280",
        success: "#2E7D32",
        warning: "#E0A800",
        danger: "#C0392B",
        info: "#1C7293",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Kaku Gothic ProN",
          "Meiryo",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(26, 43, 74, 0.08), 0 1px 2px rgba(26, 43, 74, 0.04)",
        panel: "0 4px 16px rgba(26, 43, 74, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
