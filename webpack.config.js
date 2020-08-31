/* eslint-disable @typescript-eslint/no-var-requires */

'use strict'

const path = require('path')

const BrotliPlugin = require('brotli-webpack-plugin')
const GzipPlugin = require('compression-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const OfflinePlugin = require('offline-plugin')
const { IgnorePlugin } = require('webpack')

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
  externals: {
    knockout: 'window.ko',
    moment: 'window.moment',
    'chart.js': 'window',
    tslib: 'window',
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
      externals: [
        '/android-chrome-192x192.png',
        '/android-chrome-512x512.png',
        '/apple-touch-icon.png',
        '/favicon.ico',
        '/favicon-16x16.png',
        '/favicon-32x32.png',
        '/site.webmanifest',
        'https://cdnjs.cloudflare.com/ajax/libs/tslib/2.0.1/tslib.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/knockout/3.5.1/knockout-latest.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js',
      ],
    }),
    new GzipPlugin(),
    new BrotliPlugin(),
  ],
}
