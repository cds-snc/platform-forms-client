/* istanbul ignore file */

const Schema = {
  gross_income: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['4999_or_less', 'over_5k']],
    },
  },
}

module.exports = {
  Schema,
}
