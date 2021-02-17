/* eslint-disable */
const path = require("path")
const webpack = require("webpack")
const DIST = path.resolve(__dirname, "../dist-web")
const APP = path.resolve(__dirname, "../dist")

module.exports = {
  entry: path.resolve(APP, "src/pact-web.js"),
  mode: "production",
  output: {
    path: DIST,
    library: "Pact",
    libraryTarget: "umd",
    umdNamedDefine: false,
    filename: "pact-web.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"], 
    modules: [
      path.resolve('./node_modules/popsicle/node_modules'),
      'node_modules',
    ],
    alias: {
      "form-data": path.resolve('./node_modules/popsicle/node_modules/form-data/'),
      "tough-cookie": path.resolve('./node_modules/popsicle/node_modules/tough-cookie/'),
    },
    fallback: {
      "util": false,
      "url": false,
      "querystring": false,
      "http": false,
      "https": false,
      "stream": false,
      "url": false,
      "zlib": false,
      "net": false,
      "buffer": false,
    }
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "awesome-typescript-loader",
          },
        ],
      },
      {
        test: APP,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.ProvidePlugin({ Promise: ["es6-promise", "Promise"] }),
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    new webpack.IgnorePlugin(/vertx/),
  ],
  devtool: "source-map",
}
