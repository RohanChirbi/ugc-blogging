const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      clean: true,
    },
    devServer: {
      static: path.join(__dirname, 'dist'),
      hot: true,
      port: 3000,
      open: true,
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', {loader: 'css-loader', options: { importLoaders: 1 }}, 'postcss-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        // favicon: './public/favicon.ico', // Remove or comment out if file doesn't exist
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    devtool: isProduction ? false : 'eval-source-map',
  };
};