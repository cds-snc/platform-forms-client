/* istanbul ignore file */

const Schema = {
  exception: {
    isLength: {
      errorMessage: 'errors.exception.length',
      options: { min: 3, max: 200 },
    },
  },
  supplier: {
    isLength: {
      errorMessage: 'errors.supplier.length',
      options: { min: 3, max: 1000 },
    },
  },
}

module.exports = {
  Schema,
}
