module.exports = {
  content: ["./**/*.{js,ts,jsx,tsx}"],
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
          focus: "#303FC3",
          light: "#335075",
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
      },
    },
  },
  plugins: [],
};
