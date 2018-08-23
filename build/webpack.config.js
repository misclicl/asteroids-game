const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssNano = require('cssnano');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const resolve = (...dir) => path.join(__dirname, '..', ...dir);

const envOptions = {
  production: {
    plugins: [
      new ExtractTextPlugin({
        filename: 'main.css',
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessor: cssNano,
        cssProcessorOptions: {discardComments: {removeAll: true}},
        canPrint: true,
        disable: true,
      }),
      new CleanWebpackPlugin(['dist']),
      new CopyWebpackPlugin([{
        from: resolve('src', 'assets', 'sounds'),
        to: resolve('dist', 'sounds'),
      }]),
    ],
  },
  development: {
    devServer: {
      contentBase: resolve('src', 'assets'),
      hot: true,
      proxy: {
        '/api/**': {
          target: 'http://localhost:3000/',
          secure: false,
          changeOrigin: true,
          logLevel: 'debug',
        },
      },
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
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
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
