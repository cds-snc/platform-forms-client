const cssnano = require('cssnano')

module.exports = {
  plugins: [
    require('@csstools/postcss-sass'),
    require('tailwindcss'),
    require('autoprefixer'),
    cssnano({
      preset: 'default',
    }),
  ],
}
