/* istanbul ignore file */

const Schema = {
  unchanged_income: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [
        [
          'wfh',
          'paid-leave',
          'retired',
          'student_2019_20',
          'high_school_grad',
          'none-of-the-above',
        ],
      ],
    },
  },
}

module.exports = {
  Schema,
}
