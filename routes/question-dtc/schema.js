/* istanbul ignore file */

const Schema = {
  dtc: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['yourself', 'child', 'no']],
    },
  },
}

module.exports = {
  Schema,
}

