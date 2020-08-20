/* eslint-disable @typescript-eslint/no-var-requires */

'use strict'

const path = require('path')

const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/client/app.tsx',
  output: {
    path: path.resolve(__dirname, 'public/app'),
    publicPath: '/app/',
    filename: 'entry.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat', // Must be below test-utils
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.client.json',
          },
        },
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: 'src/client/index.html',
    }),
  ],
}
