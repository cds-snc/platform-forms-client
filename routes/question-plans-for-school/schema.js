/* istanbul ignore file */

const Schema = {
  plans_for_school: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['yes', 'no']],
    },
  }, 
}

module.exports = {
  Schema,
}
