import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#F0F0F0",
        surface: {
          100: "#080808",
          200: "#121212",
          300: "#1e1e1e",
          400: "#333333",
          500: "#737373", // placeholders, subdued text
          600: "#a3a3a3"  // secondary text, icons
        },
        primary: "#FF3B30",
        status: {
          done: "#00C48C",
          progress: "#FF3B30",
          review: "#FFB800",
          pending: "#6B7280"
        }
      },
    },
  },
  plugins: [],
};
export default config;
