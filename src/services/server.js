const bluebird = require('bluebird'),
  express = require('express'),
  log = require('./log').asInternal(__filename);
let app, port;

/**
 * @param {number} startPort
 * @param {number} [tries=5]
 */
function start(startPort, tries) {
  return new bluebird(function (resolve, reject) {
    app = app || express();

    app.listen(startPort, function (err) {
      if (err && tries === 0) {
        return reject(new Error('Failed to start server.'));
      }

      port = startPort;
      resolve(startPort);
    });
  });
}

/**
 * @param {string} filename
 * @param {string} route
 * @return {string}
 */
function addTemporaryFileRoute(filename, route) {
  const real = 'http://localhost:' + port + route;

  log('info', 'addTemporaryFileRoute', {filename, route});
  app.get(route, function (req, res) {
    res.sendFile(filename, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });

  return real;
}

module.exports.start = start;
module.exports.addTemporaryFileRoute = addTemporaryFileRoute;