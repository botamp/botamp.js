module.exports = {
  env: {
    browser: true
  },
  'extends': 'standard',
  parser: 'babel-eslint',
  plugins: ['compat'],
  rules: {
    'compat/compat': 'error',
    'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }]
  }
}
