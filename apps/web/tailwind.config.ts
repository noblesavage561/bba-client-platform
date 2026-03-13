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
        brand: {
          blue: "#3f4147",
          "blue-light": "#545863",
          gold: "#2f97cf",
          "gold-light": "#63b9e5",
          ink: "#3f4147",
          "ink-soft": "#545863",
          sky: "#2f97cf",
          "sky-soft": "#63b9e5",
          cloud: "#eff1f5",
          success: "#23a55a",
          warning: "#f0b429",
          danger: "#d64545",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "var(--font-outfit)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
