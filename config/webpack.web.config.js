/* eslint-disable */
var path = require('path');
var webpack = require('webpack');

var DIST = path.resolve(__dirname, '../dist');
var APP = path.resolve(__dirname, '../src');

module.exports = {
  entry: path.resolve(APP, 'pact-web.js'),
  output: {
    path: DIST,
    library: 'Pact',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    filename: 'pact-web.js'
  },
  target: 'web',
  externals: ['mitm'],
  node: {
    net: 'empty'
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ignore-loader' },
      {
        loader: 'babel-loader',
        test: APP,
        exclude: /node_modules/,
        query: { presets: ['es2015'] }
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
