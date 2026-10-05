import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        psiko: {
          primary: "#6366f1",
          indigo: "#6366f1",
          indigoDark: "#4f46e5",
          indigoLight: "#818cf8",
          dark: "#080911",
          darker: "#04050a",
          card: "#0f101f",
          cardHover: "#171830",
          border: "#1e2040",
          borderLight: "#2d3160",
          gold: "#eab308",
          red: "#e11d48",
          purple: "#8b5cf6",
          blue: "#3b82f6",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
