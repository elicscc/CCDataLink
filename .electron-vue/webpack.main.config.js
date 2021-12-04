/*
 * @Author: your name
 * @Date: 2020-09-23 17:17:23
 * @LastEditTime: 2020-10-09 11:34:02
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \DataLinkPlatform\.electron-vue\webpack.main.config.js
 */
'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const UglifyJsPlugin = require('terser-webpack-plugin')
const ESLintWebpackPlugin = require("eslint-webpack-plugin");

let mainConfig = {
  devtool: 'cheap-module-source-map',
  entry: {
    main: path.join(__dirname, '../main.ts')
  },
  externals: { java: 'java', level: 'level' },
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
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [
    new ESLintWebpackPlugin({extensions: ['js', 'ts', 'vue'], fix:true, formatter:require('eslint-friendly-formatter'),failOnError:false} ),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json', '.node']
  },
  target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
console.log(process.env.NODE_ENV, 'webpack')
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.INDUSTRY': JSON.stringify(process.env.INDUSTRY),
      'process.env.TOC_URL': JSON.stringify(process.env.TOC_URL),
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.INDUSTRY': JSON.stringify(process.env.INDUSTRY),
      'process.env.TOC_URL': JSON.stringify(process.env.TOC_URL),
    })
  )
}

module.exports = mainConfig
