/* istanbul ignore file */

const Schema = {
  ccb: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['yes', 'no', 'unsure']],
    },
  }, 
}

module.exports = {
  Schema,
}
