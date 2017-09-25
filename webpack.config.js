const merge = require('webpack-merge')
const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

let common = {
  entry: './src/index.js'
}

let dev = merge(common, {
  output: {
    filename: 'botamp.js',
    library: 'botamp',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  }
})

let prod = merge(common, {
  devtool: 'source-map',
  output: {
    filename: 'botamp.min.js',
    library: 'botamp',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true
    })
  ]
})

module.exports = [dev, prod]
