import _ from 'lodash';
import bluebird from 'bluebird';
import fs from 'fs';
import processes from './processes';
import {getPath, setPath} from '../../shared/env';

const log = require('./log').asInternal(__filename);

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
function getPlatformEnv() {
  return bluebird.try(function () {
    let promise;
    const platform = process.platform;

    if (platform === 'darwin' || platform === 'linux') {
      promise = getBashEnv();
    } else {
      promise = bluebird.resolve({});
    }

    return promise;
  }).timeout(60000 * 2, 'Timed out trying to get environment variables from platform')
    .catch(error => {
      log('error', error);
      return {};
    });
}

/**
 * Get the environment variables for a default instance of bash
 * @returns {Promise}
 */
function getEnv() {
  return getPlatformEnv()
    .then(extraEnv => _.defaults(extraEnv, _.clone(process.env)))
    .then(env => {
      log('info', 'Got Environment Variables', env);
      return env;
    });
}

/**
 * NOTE: Verifies that the file path actually exists
 * @param {object} env
 * @param {string} filePath
 * @param {string} [variableName='path']
 */
function appendToPath(env, filePath, variableName) {
  variableName = variableName || 'path';
  const list = getPath(env, variableName);

  if (!_.includes(list, filePath) && fs.existsSync(filePath)) {
    list.push(filePath);
    setPath(env, list, variableName);
  }
}

/**
 * NOTE: Verifies that the file path actually exists
 * @param {object} env
 * @param {string} filePath
 * @param {string} [variableName='path']
 */
function prependToPath(env, filePath, variableName) {
  variableName = variableName || 'path';
  const list = getPath(env, variableName);

  if (!_.includes(list, filePath) && fs.existsSync(filePath)) {
    list.unshift(filePath);
    setPath(env, list, variableName);
  }
}

export default {
  appendToPath,
  getEnv,
  prependToPath
};
