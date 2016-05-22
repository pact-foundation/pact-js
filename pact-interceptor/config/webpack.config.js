/* eslint-disable */
var path    = require('path');
var webpack = require('webpack');

var DIST = path.resolve(__dirname, '../dist');
var APP  = path.resolve(__dirname, '../src');

module.exports = {
  entry: path.resolve(APP, 'index.js'),
  output: {
    path: DIST,
    library: 'PactInterceptor',
    libraryTarget: 'commonjs2',
    filename: 'pact-interceptor.js'
  },
  target: 'node',
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        test: APP,
        exclude: /node_modules/,
        query: { presets: ['es2015'] }
      },
      {
        loader: 'json-loader',
        test: /\.json$/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new webpack.NoErrorsPlugin()
  ]
}
