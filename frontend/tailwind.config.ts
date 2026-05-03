import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111315",
        mist: "#edf1f4",
        coral: "#ff6b5f",
        cyan: "#32c7d6",
        moss: "#8eb96f"
      }
    }
  },
  plugins: []
};

export default config;
