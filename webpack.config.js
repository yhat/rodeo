'use strict';

module.exports = {
  devtool: 'cheap-source-map',
  entry: {
    startup: './public/jsx/startup',
    main: './public/jsx/main'
  },
  externals: {
    'ascii-table': 'AsciiTable',
    jquery: 'jQuery',
    templates: 'templates',
    ace: 'ace',
    bootbox: 'bootbox'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        cacheDirectory: true,
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  node: {
    __filename: true,
    __dirname: true
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/static/js'
  },
  stats: {
    colors: true
  },
  target: 'electron-renderer'
  // watch: true
};