/* istanbul ignore file */

const Schema = {
  step1_exception: {
    isLength: {
      errorMessage: 'errors.exception.length',
      options: { min: 3, max: 200 },
    },
  },
  step1_supplier: {
    isLength: {
      errorMessage: 'errors.supplier.length',
      options: { min: 3, max: 1000 },
    },
  },
}

module.exports = {
  Schema,
}
