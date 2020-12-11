/* istanbul ignore file */

const Schema = {
  page3: {
    isLength: {
      errorMessage: 'errors.name.length',
      options: { min: 3, max: 200 },
    },
  },
}

module.exports = {
  Schema,
}
