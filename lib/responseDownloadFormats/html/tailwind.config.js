module.exports = {
  content: ["./**/*.{js,ts,jsx,tsx}", "../html-aggregated/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "noto-sans": "var(--font-noto-sans)",
        lato: "var(--font-lato)",
        mono: ["monospace"],
      },
      screens: {
        tablet: "768px",
        laptop: "1366px",
        desktop: "1920px",
      },
      width: {
        120: "30rem",
      },
      colors: {
        blue: {
          DEFAULT: "#26374A",
          default: "#26374A",
          dark: "#284162",
          light: "#335075",
          hover: "#0535D2",
          focus: "#303FC3",
          active: "#303FC3",
          100: "#B2E3FF",
          200: "#DFF8FD",
          300: "#4B98B2",
          400: "#335075",
          500: "#75b9e0",
          600: "#007cba",
          700: "#335075",
          800: "#26374a",
        },
        gray: {
          DEFAULT: "#EEE",
          front: "#333333",
        },
        red: {
          DEFAULT: "#b10e1e",
        },
        green: {
          DEFAULT: "#00703C",
        },
        black: {
          default: "#000",
          DEFAULT: "#000",
        },
      },
    },
  },
  plugins: [],
};
