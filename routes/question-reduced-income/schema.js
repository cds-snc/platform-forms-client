/* istanbul ignore file */

const Schema = {
  reduced_income: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['1000_or_less', '1001_or_more']],
    },
  }, 
}

module.exports = {
  Schema,
}
