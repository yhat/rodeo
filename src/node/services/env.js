'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  processes = require('./processes');

/**
 * @returns {Promise}
 */
function getBashEnv() {
  return new bluebird(function (resolve) {
    const child = processes.create('/bin/bash', ['--login', '-c', 'env']);
    let stdout = [];

    child.stdout.on('data', data => stdout.push(data));
    child.on('close', function () {
      const str = stdout.join(''),
        lines = str.split('\n'),
        env = {};

      _.each(lines, function (line) {
        const split = line.split('=', 2),
          key = split[0],
          value = split[1];

        if (key && value) {
          env[key] = value;
        }
      });

      resolve(_.assign({}, process.env, env));
    });
  });
}

/**
 * @returns {Promise}
 */
function getCmdEnv() {
  return new bluebird(function (resolve) {
    resolve([]);
  });
}

/**
 * Get the environment variables for a default instance of bash
 * @returns {Promise}
 */
function getEnv() {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    return getBashEnv();
  }

  return getCmdEnv();
}

module.exports.getEnv = getEnv;
