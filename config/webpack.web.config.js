/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const DIST = path.resolve(__dirname, '../dist-web');
const APP = path.resolve(__dirname, '../dist');

module.exports = {
  entry: path.resolve(APP, 'pact-web.js'),
  output: {
    path: DIST,
    library: 'Pact',
    libraryTarget: 'umd',
    umdNamedDefine: false,
    filename: 'pact-web.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  target: 'web',
  node: {
    net: 'empty'
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        loader: 'babel-loader',
        test: APP,
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ],
  },
  plugins: [
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new webpack.IgnorePlugin(/vertx/),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  devtool: 'source-map'
};
