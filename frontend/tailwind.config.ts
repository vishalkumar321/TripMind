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
        // New TripMind design system
        background: "#F5F0E8",   // warm cream
        surface: "#FFFFFF",   // card white
        dark: "#1a1a2e",   // navbar / sidebar
        accent: "#E07B4F",   // orange CTA
        "accent-dark": "#C05A2A",
        text: "#1a1a2e",
        muted: "#888888",
        // keep gold as alias for accent for any remnant use
        gold: "#E07B4F",
      },
      fontFamily: {
        fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sora: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        playfair: ['var(--font-fraunces)', 'Georgia', 'serif'], // legacy alias
      },
      borderRadius: {
        card: '20px',
        pill: '100px',
        small: '12px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
