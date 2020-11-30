/* istanbul ignore file */

const Schema = {
  province: {
    isIn: {
      errorMessage: 'errors.multipleChoiceGeneric',
      options: [['ab', 'bc', 'mb', 'nb', 'nl', 'ns', 'nt', 'nu', 'on', 'pe', 'qc', 'sk', 'yt']],
    },
  },
}

module.exports = {
  Schema,
}
