module.exports = {
  extends: [
    'standard',
    'prettier',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:security/recommended',
  ],
  plugins: ['jest', 'security'],
  env: {
    'jest/globals': true,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'security/detect-object-injection': 'off',
    'security/detect-non-literal-require': 'off',
    'security/detect-non-literal-fs-filename': 'off',
  },
}
