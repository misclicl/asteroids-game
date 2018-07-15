const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssNano = require('cssnano');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const resolve = (...dir) => path.join(__dirname, '..', ...dir);

const envOptions = {
  production: {
    plugins: [
      new ExtractTextPlugin({
        filename: 'main.css',
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessor: cssNano,
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true,
        disable: true,
      }),
      new CleanWebpackPlugin(['dist']),
    ],
  },
  development: {
    devServer: {
      contentBase: resolve('dist'),
      hot: true,
    },
    devtool: 'eval-source-map',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ExtractTextPlugin({
        disable: true,
      }),
    ],
  },
};

const baseConfig = {
  entry: resolve('src', 'main.js'),
  output: {
    path: resolve('dist'),
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: resolve('src'),
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('src', 'index.html'),
    }),
  ],
};

module.exports = (env, argv) => merge(baseConfig, envOptions[argv.mode]);
