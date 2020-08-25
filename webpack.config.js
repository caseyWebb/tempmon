/* eslint-disable @typescript-eslint/no-var-requires */

'use strict'

const path = require('path')

const BrotliPlugin = require('brotli-webpack-plugin')
const GzipPlugin = require('compression-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const OfflinePlugin = require('offline-plugin')
const { IgnorePlugin } = require('webpack')

const production = isProduction()

const htmlTerserOptions = {
  removeAttributeQuotes: false,
  ignoreCustomComments: [/^\s*\/?ko/],
  caseSensitive: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  keepClosingSlash: true,
  minifyCSS: true,
  minifyJS: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
}

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/client/index.ts',
  output: {
    path: path.resolve(__dirname, 'public/app'),
    publicPath: '/app/',
    filename: 'entry.[chunkhash].js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
  },
  resolve: {
    alias: {
      knockout$: path.resolve(
        __dirname,
        'node_modules/knockout/build/output',
        production ? 'knockout-latest.js' : 'knockout-latest.debug.js'
      ),
    },
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
            minimize: htmlTerserOptions,
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
    new IgnorePlugin(/^\.\/locale$/, /moment$/),
    new HTMLWebpackPlugin({
      template: 'src/client/index.html',
      minify: htmlTerserOptions,
    }),
    new OfflinePlugin({
      appShell: '/app/',
      responseStrategy: 'cache-first',
    }),
    new GzipPlugin(),
    new BrotliPlugin(),
  ],
}

function isProduction() {
  const i = process.argv.indexOf('--mode')
  if (i > 0) return process.argv[i + 1] === 'production'
  return false
}
