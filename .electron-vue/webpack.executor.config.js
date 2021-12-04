'use strict'

process.env.BABEL_ENV = 'executor'

const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const terser = require('terser-webpack-plugin')
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const fs = require("fs")


let executorConfig = {
  devtool: 'cheap-module-source-map',
  mode: process.env.NODE_ENV || 'development',
  entry: {
    renderer: path.join(__dirname, '../app/script/executor.ts')
  },
  externals: {java: 'java'},
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  plugins: [new BundleAnalyzerPlugin({
    analyzerMode: 'static',
  })],
  output: {
    filename: 'executor.js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist')
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.node']
  },
  target: 'node'
}
/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  executorConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
      'process.env.EXECUTOR': JSON.stringify(process.env.EXECUTOR),
      'process.env.PACKAGE': JSON.stringify(process.env.PACKAGE),
      'process.env.INDUSTRY': JSON.stringify(process.env.INDUSTRY),
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  )
}

if (process.env.PACKAGE === 'mini'){
  executorConfig.devtool = ''
  executorConfig.plugins.push(new terser())
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  executorConfig.devtool = ''
  let copyPlugin
  if (process.env.EXECUTOR === '1') {
    copyPlugin = new CopyWebpackPlugin([{
      from: 'static/chrome-linux', to: '../dist/static/chrome-linux'
    }])
  } else if (process.env.EXECUTOR === '2') {
    copyPlugin = new CopyWebpackPlugin([{
      from: 'static/chrome-win', to: '../dist/static/chrome-win'
    }])
  }
  executorConfig.plugins.push(
    new ESLintWebpackPlugin({extensions: ['js', 'ts', 'vue'], fix:true, formatter:require('eslint-friendly-formatter'),failOnError:false} ),
    new terser(),
    new webpack.DefinePlugin({
      'process.env.INDUSTRY': JSON.stringify(process.env.INDUSTRY),
      'process.env.NODE_ENV': JSON.stringify('production'),
      // 通过读取打包的时候命令行的executor值,定义代码中的executor类型值,1 代表linux 2 代表 windows
      'process.env.EXECUTOR': JSON.stringify(process.env.EXECUTOR)
    }),
    copyPlugin,
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

module.exports = executorConfig
