/* eslint-disable @typescript-eslint/no-var-requires */

'use strict'

const path = require('path')

const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/client/index.ts',
  output: {
    path: path.resolve(__dirname, 'public/app'),
    publicPath: '/app/',
    filename: 'entry.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.client.json',
          },
        },
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            attributes: false,
            minimize: {
              removeAttributeQuotes: false,
              ignoreCustomComments: [/^\s*\/?ko/],
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: 'src/client/index.html',
    }),
  ],
}
