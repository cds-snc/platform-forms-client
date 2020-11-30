const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      colors: {
        blue: {
          ...colors.blue,
          '200': '#E1F0F8',
          '800': '#194D7B',
          '900': '#38414d',
          'lighter': '#E1F0F8',
          'darker': '#194D7B',
        },
        gray: {
          ...colors.gray,
          '100': '#f8f8f8',
          '200': '#f7fafc',
          '300': '#e2e8f0',
          '400': '#cbcbcb',
          '600': '#808080',
          '700': '#666666',
        },
        red: {
          ...colors.red,
          'lighter': '#FFE7E7',
          'darker': '#C80707',
        },
        green: {
          ...colors.green,
          'lighter': '#DFF0D8',
          'darker': '#138A00',
        },
        orange: { 
          ... colors.orange,
          '700': '#C78100',
        },
      },
      maxWidth: {
        '950': '950px',
      },
    },

    boxShadow: {
      result: '0px 0px 12px -2px rgba(0,0,0,0.4)',
    },
    borderWidth: {
      default: '1px',
      '0': '0',
      '2': '2px',
      '2.5': '2.5px',
      '3': '3px',
      '4': '4px',
      '8': '8px',
    },
    zIndex: { 
      '-1': '-1,',
      '100': '100,',
    },
  },
  variants: {},
  plugins: [],
  important: true,
  purge: {
    content: ['./routes/**/*.njk', './views/**/*.njk'],
    options: {
      whitelist: ['./assets/components/_dropdown.scss'],
    },
  },
}
