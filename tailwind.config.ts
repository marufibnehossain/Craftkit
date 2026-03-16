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
        bg: "var(--bg)",
        surface: "var(--surface)",
        "brand-light": "var(--brand-light)",
        "brand-mid": "var(--brand-mid)",
        "brand-dark": "var(--brand-dark)",
        "secondary-light": "var(--secondary-light)",
        "secondary-40": "var(--secondary-40)",
        "secondary-60": "var(--secondary-60)",
        "secondary-100": "var(--secondary-100)",
        "dark-100": "var(--dark-100)",
        "dark-80": "var(--dark-80)",
        "dark-60": "var(--dark-60)",
        "dark-40": "var(--dark-40)",
        "dark-20": "var(--dark-20)",
        "body-muted": "var(--body-muted)",
        "neutral-60": "var(--neutral-60)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
