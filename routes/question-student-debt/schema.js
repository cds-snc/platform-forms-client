/* istanbul ignore file */

const Schema = {
  student_debt: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['yes', 'no']],
    },
  }, 
}

module.exports = {
  Schema,
}
