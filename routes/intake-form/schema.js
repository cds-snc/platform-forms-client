/* istanbul ignore file */

const Schema = {
  name: {
    isLength: {
      errorMessage: 'errors.firstname.length',
      options: { min: 3, max: 200 },
    },
  },
  email: {
    isEmail: {
      errorMessage: 'errors.email.length',
    },
  },
  description: {
    isLength: {
      errorMessage: 'errors.description.length',
      options: { min: 3, max: 1000 },
    },
  },
}

module.exports = {
  Schema,
}
