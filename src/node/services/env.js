'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  log = require('./log').asInternal(__filename),
  processes = require('./processes'),
  win32System = require('./win32/system');

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
 *
 * @returns {Promise}
 */
function getPlatformEnv() {
  return bluebird.try(function () {
    let promise;
    const platform = process.platform;

    if (platform === 'darwin' || platform === 'linux') {
      promise = getBashEnv();
    } else if (platform === 'win32') {
      promise = win32System.getEnv(process.env.SystemRoot);
    } else {
      promise = bluebird.resolve({});
    }

    return promise;
  });
}

/**
 * Get the environment variables for a default instance of bash
 * @returns {Promise}
 */
function getEnv() {
  return getPlatformEnv()
    .then(extraEnv => _.defaults(extraEnv, process.env))
    .catch(error => {
      log('error', 'getEnv', error);
      return process.env;
    });
}

module.exports.getEnv = getEnv;
