const { colors } = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./pages/**/*.js", "./components/**/*.js"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        blue: {
          ...colors.blue,
          default: "#26374A",
          800: "#194D7B",
          900: "#38414d",
          lighter: "#E1F0F8",
          darker: "#194D7B",
          100: "#B2E3FF",
          200: "#DFF8FD",
          300: "#4B98B2",
          400: "#335075",
          500: "#75b9e0",
        },
        gray: {
          ...colors.gray,
          100: "#f8f8f8",
          200: "#f7fafc",
          300: "#e2e8f0",
          400: "#cbcbcb",
          600: "#808080",
          700: "#666666",
        },
        red: {
          ...colors.red,
          lighter: "#FFE7E7",
          darker: "#C80707",
        },
        green: {
          ...colors.green,
          lighter: "#DFF0D8",
          darker: "#138A00",
        },
        orange: {
          ...colors.orange,
          700: "#C78100",
        },
      },
      maxWidth: {
        950: "950px",
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
