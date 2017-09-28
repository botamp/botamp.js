module.exports = {
  env: {
    browser: true
  },
  parser: 'babel-eslint',
  plugins: ['compat'],
  rules: {
    'compat/compat': 'error'
  }
}
