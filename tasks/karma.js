'use strict';

const karma = require('karma'),
  KarmaServer = karma.Server,
  path = require('path');

module.exports.importTasks = function (gulp) {
  /**
   *
   * @param {string} configFile
   * @returns {Promise}
   */
  function runKarma(configFile) {
    return new Promise(function (resolve, reject) {
      const server = new KarmaServer({
        configFile: path.join(__dirname, '..', configFile),
        singleRun: true
      }, function (result) {
        if (result > 0) {
          return reject(new Error(`Karma exited with status code ${result}`));
        }

        resolve();
      });

      server.start();
    });
  }

  gulp.task('karma', function () {
    return runKarma('karma.node.conf.js');
  });
};
