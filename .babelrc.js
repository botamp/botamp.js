module.exports = {
  env: {
    development: {
      presets: [['env', { modules: false, useBuiltIns: 'usage' }]],
      plugins: ['external-helpers']
    },
    test: {
      presets: ['env']
    }
  }
};
