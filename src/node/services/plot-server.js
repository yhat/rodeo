'use strict';

const bluebird = require('bluebird'),
  express = require('express'),
  log = require('./log').asInternal(__filename),
  defaultHostname = 'localhost',
  defaultBacklog = 511;
let PlotServer;

PlotServer = function (port) {
  this.port = port;
  this.app = express();
};
PlotServer.prototype = {
  listen() {
    const app = this.app,
      port = this.port,
      listen = bluebird.promisify(app.listen, {context: app});

    return listen(port, defaultHostname, defaultBacklog).return(port);
  },
  /**
   * Add route to file
   * @param {string} filename
   * @param {string} route
   * @returns {string}
   */
  addRouteToFile(filename, route) {
    const app = this.app,
      port = this.port,
      real = 'http://localhost:' + port + route;

    app.get(route, function (req, res) {
      log('info', 'sending file', {filename, route, port});
      res.sendFile(filename, function (err) {
        log('info', 'sending file result', err);
        if (err) {
          log('error', 'sending file', filename);
          res.status(err.status).end();
        }
      });
    });

    return real;
  }
};

module.exports = PlotServer;
