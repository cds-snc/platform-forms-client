/* istanbul ignore file */

const Schema = {
  mortgage_payments: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['yes-mortgage', 'yes-rent', 'no']],
    },
  }, 
}

module.exports = {
  Schema,
}
