const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      width: {
        "cr-label-desktop": "50rem",
        "cr-label-1025": "30rem",
        "cr-label-ipad": "25rem",
        "cr-label-duo": "24rem",
        "cr-label-6s": "15rem",
        "cr-label-5s": "14rem",
        "cr-label-fold": "11.5rem",
        "flag-desktop": "22.5rem",
        "flag-6s": "18rem",
        "flag-5s": "16.5rem",
        "flag-fold": "15rem",
      },
      margin: {
        "10px": "10px",
      },
      outline: {
        default: ["3px solid #ffbf47"],
      },
      backgroundPosition: {
        "center-right-15px": "center right 15px",
      },
      inset: {
        "10px": "10px",
        "9px": "9px",
      },
      maxWidth: {
        prose: "75ch",
      },
      listStyleType: {
        disc: "disc",
        decimal: "decimal",
        circle: "circle",
      },
      colors: {
        current: "currentColor",
        red: {
          DEFAULT: "#b10e1e",
          default: "#b10e1e",
          100: "#f3e9e8",
          destructive: "#892406",
          hover: "#4E1504",
        },
        purple: {
          ...colors.violet,
          DEFAULT: "#6300C7",
          default: "#6300C7",
        },
        white: {
          DEFAULT: "#FFF",
          default: "#FFF",
        },
        blue: {
          DEFAULT: "#26374A",
          default: "#26374A",
          dark: "#284162",
          light: "#335075",
          hover: "#0535D2",
          focus: "#303FC3",
          active: "#1B2736",
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
          default: "#EEE",
          selected: "#e1e4e7",
          text: "#585858",
          background: "#f4f4f4",
          500: "#a0aec0",
          600: "#718096",
          700: "#4a5568",
          800: "#2d3748",
        },
        yellow: {
          ...colors.amber,
          default: "#ffbf47",
          DEFAULT: "#ffbf47",
        },
        green: {
          ...colors.emerald,
          default: "#00703C",
          DEFAULT: "#00703C",
          light: "#ECF3EC",
          darker: "#005930",
        },
        black: {
          default: "#000",
          DEFAULT: "#000",
          form: "#0b0c0c",
        },
        transparent: "transparent",
      },
      fontSize: {
        badge: ["14px", "14px"],
        sm: ["16px", "22px"],
        base: ["20px", "28px"],
        p: ["20px", "28px"],
        h3: ["26px", "32px"],
        h2: ["30px", "38px"],
        h1: ["34px", "44px"],
        small_sm: ["12px", "14px"],
        small_base: ["16px", "22px"],
        small_p: ["16px", "22px"],
        small_h3: ["18px", "22px"],
        small_h2: ["20px", "28px"],
        small_h1: ["24px", "28px"],
      },
      zIndex: {
        "-1": "-1,",
        100: "100,",
      },
      borderWidth: {
        default: "1px",
        0: "0",
        1: "1px",
        1.5: "1.5px",
        2: "2px",
        2.5: "2.5px",
        3: "3px",
        4: "4px",
        5: "5px",
        8: "8px",
      },
      boxShadow: {
        default: "0 1px 3px rgba(0, 0, 0, 0.05);",
        result: "0px 0px 12px -2px rgba(0,0,0,0.4)",
        input: "inset 0 0 0 2px #0535d2",
        none: "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
      },
      screens: {
        tablet: "768px",
        laptop: "1366px",
        desktop: "1920px",
      },
    },
    container: {
      center: true,
    },
    fontFamily: {
      sans: ["Lato", ...defaultTheme.fontFamily.sans],
      body: ['"Noto Sans"'],
      mono: ["monospace"],
    },
    screens: {
      xxl: { max: "1200px" },
      xl: { max: "992px" },
      lg: { max: "768px" },
      md: { max: "550px" },
      sm: { max: "450px" },
      xs: { max: "320px" },
      xxs: { max: "290px" },
    },
  },
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("@tailwindcss/line-clamp")],
};
