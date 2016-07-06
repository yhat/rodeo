'use strict';

const path = require('path');

module.exports = {
  context: path.join(__dirname, 'src/browser/jsx'),
  devtool: 'source-map',
  entry: {
    startup: [
      'react-hot-loader/patch',
      './entry/startup'
    ],
    main: [
      'react-hot-loader/patch',
      './entry/main'
    ],
    'free-tabs-only': [
      'react-hot-loader/patch',
      './entry/free-tabs-only'
    ]
  },
  externals: {
    'ascii-table': 'AsciiTable',
    jquery: 'jQuery',
    templates: 'templates',
    ace: 'ace',
    ipc: 'ipc'
  },
  module: {
    // preLoaders: [
    //   {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
    // ],
    loaders: [
      { test: /\.json/, loader: 'json' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.(png|gif)$/, loader: 'url?name=[name].[hash].[ext]&limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.svg$/, loaders: ['file?name=[name].[hash].[ext]', 'svgo?useConfig=svgoConfig1'] },
      { test: /\.md$/, loader: 'raw' }, // because we sometimes treat it differently based on the context (i.e., code)
      { test: /\.ya?ml$/, loader: 'json!yaml' }, // some things we want to change often, so it goes in config files
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
    path: path.join(__dirname, 'dist')
  },
  stats: {
    colors: true
  },
  svgoConfig1: {
    plugins: [
      {removeTitle: true},
      {convertColors: {shorthex: false}},
      {convertPathData: false}
    ]
  },
  target: 'electron-renderer'
  // watch: true
};
