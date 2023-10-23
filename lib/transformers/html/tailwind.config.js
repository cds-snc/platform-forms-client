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
      colors: {
        blue: {
          focus: "#303FC3",
        },
        gray: {
          front: "#333333",
        },
        red: {
          DEFAULT: "#b10e1e",
        },
      },
    },
  },
  plugins: [],
};
