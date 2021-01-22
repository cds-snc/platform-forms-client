const { colors } = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./pages/**/*.js", "./components/**/*.js"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        red: {
          ...colors.red,
          100: "#f3e9e8",
          default: "#b10e1e",
        },
        white: {
          ...colors.white,
          default: "#FFF",
        },
        blue: {
          ...colors.blue,
          default: "#26374A",
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
          ...colors.gray,
          default: "#EEE",
          selected: "#e1e4e7",
          500: "#a0aec0",
          600: "#718096",
          700: "#4a5568",
          800: "#2d3748",
        },
        yellow: {
          ...colors.yellow,
          default: "#ffbf47",
        },
        green: {
          ...colors.green,
          default: "#00703C",
          darker: "#002D18",
        },
        black: {
          ...colors.black,
          default: "#000",
        },
      },
      maxWidth: {
        950: "950px",
      },
      fontSize: {
        base: "1.25rem",
        lg: "2rem",
        xl: "2.25rem",
      },
    },

    boxShadow: {
      result: "0px 0px 12px -2px rgba(0,0,0,0.4)",
    },
    borderWidth: {
      default: "1px",
      0: "0",
      2: "2px",
      2.5: "2.5px",
      3: "3px",
      4: "4px",
      8: "8px",
    },
    zIndex: {
      "-1": "-1,",
      100: "100,",
    },
    fontFamily: {
      sans: ["lato"],
      body: ["Noto Sans"],
    },
    screens: {
      xxs: "280px",
      xs: "325px",
      sm: "450px",
      md: "550px",
      lg: "768px",
      xl: "1024px",
    },
    container: {
      center: true,
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("tailwindcss"), require("precss"), require("autoprefixer")],
};
