/* istanbul ignore file */

const Schema = {
  page4: {
    isLength: {
      errorMessage: 'errors.name.length',
      options: { min: 3, max: 200 },
    },
  },
}

module.exports = {
  Schema,
}
