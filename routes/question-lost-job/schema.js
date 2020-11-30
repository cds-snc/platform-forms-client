/* istanbul ignore file */

const Schema = {
  lost_job: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['lost-all-income', 'lost-some-income', 'lost-no-income']],
    },
  },
}

module.exports = {
  Schema,
}
