/**
 * Copyright 2017 A.D.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

const OUT_PATH = path.resolve('./dist');
const PUBLIC_PATH = '/assets/';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const IS_PROD = process.env.AD_ENV === 'production';
const IS_DEV = process.env.AD_ENV === 'development';

const banner = [
  '/*!',
  ' Javascript framework for building user interfaces',
  ` Copyright (c) ${new Date().getFullYear()} A.D.`,
  ' License: Apache-2.0',
  '*/',
].join('\n');

const createBannerPlugin = () => new webpack.BannerPlugin({
  banner: banner,
  raw: true,
  entryOnly: true,
});

const CSS_LOADER_CONFIG = [
  {
    loader: 'css-loader',
    options: {
      sourceMap: true,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: IS_DEV,
      plugins: () =>[require('autoprefixer')({grid: false})],
    },
  },
  {
    loader: 'sass-loader',
    options: {
      sourceMap: true,
      includePaths: glob.sync('packages/*/node_modules').map((d) => path.join(__dirname, d)),
    },
  },
];


module.exports = [{
  name: 'js-components',
  entry: {
    'base': path.resolve('./packages/ad-base/index.js'),
    'cm': path.resolve('./packages/ad-control-manager/index.js'),
  },
  output: {
    filename: 'ad.[name].' + (IS_PROD ? 'min.' : '') + 'js',
    path: OUT_PATH,
    publicPath: PUBLIC_PATH,
    library: ['ad', '[name]'],
  },
  devServer: {
    disableHostCheck: true,
  },
  devtool: IS_DEV ? 'source-map' : false,
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    }],
  },
  plugins: [
    createBannerPlugin(),
  ],
}, {
  name: 'css',
  entry: {
    'normalize': path.resolve('./packages/ad-normalize/normalize.scss'),
  },
  output: {
    // In development, these are emitted as js files to facilitate hot module replacement. In
    // all other cases, ExtractTextPlugin is used to generate the final css, so this is given a
    // dummy ".css-entry" extension.
    filename: 'ad.[name].' + (IS_PROD ? 'min.' : '') + 'css' + (IS_DEV ? '.js' : '-entry'),
    path: OUT_PATH,
    publicPath: PUBLIC_PATH,
  },
  devServer: {
    disableHostCheck: true,
  },
  devtool: IS_DEV ? 'source-map' : false,
  module: {
    rules: [{
      test: /\.scss$/,
      use: IS_DEV ? [{loader: 'style-loader'}].concat(CSS_LOADER_CONFIG) : ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: CSS_LOADER_CONFIG,
      }),
    }],
  },
  plugins: [
    new ExtractTextPlugin('ad.[name].' + (IS_PROD ? 'min.' : '') + 'css'),
    createBannerPlugin(),
  ],
}];

if (IS_DEV) {
  module.exports.push({
    name: 'demo-css',
    entry: {
      'demo-styles': path.resolve('./demos/demos.scss'),
    },
    output: {
      path: OUT_PATH,
      filename: '[name].css.js',
    },
    devServer: {
      disableHostCheck: true,
    },
    devtool: 'source-map',
    module: {
      rules: [{
        test: /\.scss$/,
        use: [{loader: 'style-loader'}].concat(CSS_LOADER_CONFIG),
      }],
    },
    plugins: [
      createBannerPlugin(),
    ],
  });
};
