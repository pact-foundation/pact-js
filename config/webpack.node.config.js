/* eslint-disable */
var path    = require('path');
var webpack = require('webpack');

var DIST = path.resolve(__dirname, '../dist');
var APP  = path.resolve(__dirname, '../src');

module.exports = {
  entry: [
    path.resolve(APP, 'pact.js')
  ],
  output: {
    path: DIST,
    library: 'Pact',
    libraryTarget: 'commonjs2',
    filename: 'pact.js'
  },
  target: 'node',
  externals: [ 'mitm' ],
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
    new webpack.IgnorePlugin(/vertx/),
    new webpack.optimize.DedupePlugin(),
    new webpack.NoErrorsPlugin()
  ],
  devtool: 'source-map'
}
