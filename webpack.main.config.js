'use strict';

const pkg = require('./package.json'),
  path = require('path'),
  webpack = require('webpack'),
  CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  context: __dirname,
  devtool: 'source-map',
  entry: {
    startup: [
      './src/node/index.js'
    ]
  },
  externals: Object.keys(pkg.dependencies || {}).concat(['original-fs']),
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
      { test: /\.(md|py)$/, loader: 'raw' }, // because we sometimes treat it differently based on the context (i.e., code)
      { test: /\.ya?ml$/, loader: 'json!yaml' }, // some things we want to change often, so it goes in config files
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components|~\/)/,
        loader: 'babel',
        cacheDirectory: true,
        query: {
          plugins: [
            'lodash',
            'Transform-runtime',
            'Transform-react-remove-prop-types',
            'Transform-react-constant-elements',
            'Transform-react-inline-elements'
          ],
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'node_modules/rulejs'),
          path.resolve(__dirname, 'node_modules/lodash')
        ],
        loader: 'babel',
        cacheDirectory: true,
        query: {
          plugins: ['lodash'],
          presets: ['es2015']
        }
      }
    ]
  },
  node: {
    __filename: false,
    __dirname: false
  },
  plugins: [
    // new webpack.optimize.OccurrenceOrderPlugin(),
    // new webpack.NoErrorsPlugin(),
    // new webpack.optimize.DedupePlugin(),
    // new webpack.DefinePlugin({
    //   __APP_NAME__: JSON.stringify(pkg.name),
    //   __VERSION__: JSON.stringify(pkg.version),
    //   'process.env': {
    //     NODE_ENV: JSON.stringify('production')
    //   }
    // }),
    // new webpack.optimize.UglifyJsPlugin ({
    //   beautify: false,
    //   comments: false,
    //   compress: {
    //     sequences: true,
    //     booleans: true,
    //     loops: true,
    //     unused: true,
    //     warnings: false,
    //     drop_console: true,
    //     unsafe: true
    //   },
    //   test: /\.(js|jsx)$/
    // }),
    // new CompressionPlugin ({
    //   asset: '[path] .gz [query]',
    //   algorithm: 'gzip',
    //   test: /\.js$|\.html$/,
    //   threshold: 10240,
    //   minRatio: 0.8
    // })
  ],
  output: {
    path: __dirname,
    filename: './app/node/index.js',
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
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
  target: 'electron-main'
};
