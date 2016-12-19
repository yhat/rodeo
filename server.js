import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack.dev.config.js';
import findPort from 'find-port';

const app = express(),
  compiler = webpack(config);
let PORT;

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  stats: {
    colors: true
  }
}));

app.use(webpackHotMiddleware(compiler, {
  log: console.log,
  path: '/__webpack_hmr',
  heartbeat: 10 * 1000
}));

// before binding our server to a port, check each port in the given range
// to ensure it's available. Upon return, just go ahead with the first element
findPort('localhost', [3001, 9000, 9001, 9002], (ports) => {

  // make use of the first available port returned
  PORT = ports[0];
  app.listen(PORT, 'localhost', err => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`Listening at http://localhost:${PORT}`);
  });

});


