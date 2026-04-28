import type { Config } from "tailwindcss";

import corePreset from "@gcforms/core/tailwind-preset";

module.exports = {
  presets: [corePreset],
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [],
} satisfies Config;
