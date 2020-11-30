/* istanbul ignore file */

const Schema = {
  firstname: {
    isLength: {
      errorMessage: 'errors.firstname.length',
      options: { min: 3, max: 200 },
    },
  },
}

module.exports = {
  Schema,
}
