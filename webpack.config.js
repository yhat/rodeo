'use strict';

module.exports = {
  devtool: 'source-map',
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
    // preLoaders: [
    //   {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
    // ],
    loaders: [
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: 'style!css?sourceMap' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        cacheDirectory: true,
        query: {
          plugins: ['lodash'],
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