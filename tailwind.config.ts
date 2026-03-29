import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#090f14",
        slatepanel: "#111b24",
        steel: "#1a2a36",
        ice: "#82d6ff",
        alert: "#ff4d5d",
        caution: "#ffb347",
        ally: "#7ab893",
        ink: "#d8e5ed",
        mist: "#8ca4b3"
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(130,214,255,0.12), 0 12px 28px rgba(0,0,0,0.45)",
        glow: "0 0 28px rgba(130,214,255,0.12)",
        alert: "0 0 32px rgba(255,77,93,0.24)"
      },
      backgroundImage: {
        "scan-grid": "linear-gradient(to right, rgba(125,171,196,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(125,171,196,0.05) 1px, transparent 1px)",
        "fog-radial": "radial-gradient(circle at 14% -5%, rgba(0,164,255,0.25), transparent 40%), radial-gradient(circle at 84% 14%, rgba(255,77,93,0.15), transparent 45%), radial-gradient(circle at 50% 100%, rgba(72,105,130,0.2), transparent 50%)"
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        alertIn: {
          "0%": { opacity: "0", transform: "translateX(14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        }
      },
      animation: {
        pulseSoft: "pulseSoft 3.2s ease-in-out infinite",
        ticker: "ticker 24s linear infinite",
        alertIn: "alertIn 280ms ease-out"
      }
    }
  },
  plugins: []
};

export default config;
