import tokens from "@gcds-core/tokens/build/figma/figma.tokens.json";
const {
  red,
  green,
  blue,
  grayscale,
  "blue-muted": blueMuted,
  "blue-vivid": blueVivid,
} = tokens.Tokens.color;

// Extract spacing tokens
const spacing = Object.entries(tokens.Tokens.spacing).reduce((acc, [key, value]) => {
  acc[key] = value.value;
  return acc;
}, {});

module.exports = {
  theme: {
    extend: {
      spacing,
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
      fontSize: {
        sm: ["16px", "22px"],
        base: ["18px", "28px"],
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
        white: {
          DEFAULT: "#FFF",
          default: "#FFF",
        },
        black: {
          default: "#000",
          DEFAULT: "#000",
        },
        // see: https://design-system.alpha.canada.ca/en/styles/colour/
        gcds: {
          grayscale: {
            50: grayscale[50].value,
            100: grayscale[100].value,
            300: grayscale[300].value,
            500: grayscale[500].value,
            700: grayscale[700].value,
            800: grayscale[800].value,
            900: grayscale[900].value,
          },
          blue: {
            100: blue[100].value,
            500: blue[500].value,
            700: blue[700].value,
            800: blue[800].value,
            muted: blueMuted.value,
            vivid: blueVivid.value,
          },
          green: {
            100: green[100].value,
            500: green[500].value,
            700: green[700].value,
          },
          red: {
            100: red[100].value,
            500: red[500].value,
            700: red[700].value,
            900: red[900].value,
          },
        },
      },
    },
  },
  content: [
    "./**/*.{js,ts,jsx,tsx}",
    "../html-aggregated/**/*.{js,ts,jsx,tsx}",
    "../../saveAndResume/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
};
