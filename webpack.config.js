var path = require('path')
var webpack = require('webpack')
const WebpackWebExt = require('webpack-webext-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      // {
      //   test: /\.json/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[name].[ext]'
      //       }
      //     },
      //     {loader: 'extract-loader'},
      //     {
      //       loader: 'chrome-manifest-loader',
      //       options: {
      //         mapVersion: true,
      //       }
      //     }
      //   ]
      // }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': './src',
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#source-map'
}

if (process.env.NODE_ENV === 'production') {
  // module.exports.devtool = '#source-map'
  // // http://vue-loader.vuejs.org/en/workflow/production.html
  // module.exports.plugins = (module.exports.plugins || []).concat([
  //   new webpack.DefinePlugin({
  //     'process.env': {
  //       NODE_ENV: '"production"'
  //     }
  //   }),
  //   new webpack.optimize.UglifyJsPlugin({
  //     sourceMap: true,
  //     compress: {
  //       warnings: false
  //     }
  //   }),
  //   new webpack.LoaderOptionsPlugin({
  //     minimize: true
  //   })
  // ])
} else {
  // module.exports.plugins = (module.exports.plugins || []).concat([
  //   new WebpackWebExt({
  //     runOnce: true,
  //     maxRetries: 3,
  //     argv: ["run", "--firefox", "beta", "--browser-console"],
  //   })
  // ])
}
