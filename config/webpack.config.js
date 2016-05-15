/* eslint-disable */
var path    = require('path');
var webpack = require('webpack');

var DIST = path.resolve(__dirname, '../dist');
var DSL  = path.resolve(__dirname, '../src/pact-consumer-dsl');
var MUI  = path.resolve(__dirname, '../src/pact-mocha-interface');

module.exports = {
  entry: [
    path.resolve(DSL, 'pact.js')
  ],
  output: {
    path: DIST,
    library: 'Pact',
    filename: 'pact-consumer-js-dsl.js'
  },
  externals: [
    { 'mitm': true }
  ],
  debug: true,
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        test: DSL,
        exclude: /node_modules/,
        query: { presets: ['es2015'] }
      }
    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  devtool: 'source-map'
}
