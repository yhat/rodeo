const path = require('path'),
  pkg = require('./package.json'),
  webpack = require('webpack');

module.exports = {
  cache: true,
  context: path.join(__dirname, 'src'),
  debug: true,
  devtool: 'source-map',
  entry: {
    startup: [
      'react-hot-loader/patch',
      'webpack-hot-middleware/client?path=http://localhost:3001/__webpack_hmr',
      'webpack/hot/only-dev-server',
      './browser/entry/startup'
    ],
    main: [
      'react-hot-loader/patch',
      'webpack-hot-middleware/client?path=http://localhost:3001/__webpack_hmr',
      'webpack/hot/only-dev-server',
      './browser/entry/main'
    ],
    'free-tabs-only': [
      'react-hot-loader/patch',
      'webpack-hot-middleware/client?path=http://localhost:3001/__webpack_hmr',
      'webpack/hot/only-dev-server',
      './browser/entry/free-tabs-only'
    ]
  },
  externals: {
    'ascii-table': 'AsciiTable',
    jquery: 'jQuery',
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
      { test: /\.(png|gif)$/, loader: 'url?name=[name].[hash].[ext]&limit=8192&&outputPath=app' }, // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.svg$/, loaders: ['file?name=[name].[hash].[ext]', 'svgo?useConfig=svgoConfig1&&outputPath=app'] },
      { test: /\.(md|py)$/, loader: 'raw' }, // because we sometimes treat it differently based on the context (i.e., code)
      { test: /\.ya?ml$/, loader: 'json!yaml' }, // some things we want to change often, so it goes in config files
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        cacheDirectory: true,
        query: {
          plugins: ['react-hot-loader/babel', 'lodash'],
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'node_modules/rulejs')
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
    __filename: true,
    __dirname: true
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      __APP_NAME__: JSON.stringify(pkg.name),
      __VERSION__: JSON.stringify(pkg.version)
    })
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'app'),
    publicPath: 'http://localhost:3001/app/'
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
};
