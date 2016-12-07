/**
 * Things related directly to the format of the language interpreters or language
 * @module
 */

import _ from 'lodash';
import fs from 'fs';
import os from 'os';
import path from 'path';

const log = require('../../services/log').asInternal(__filename);

/**
 * @param {object} args
 * @returns {object}
 */
function toPythonArgs(args) {
  return _.reduce(args, function (obj, value, key) {
    obj[_.snakeCase(key)] = value;
    return obj;
  }, {});
}

function addPath(envs, path) {
  if (!_.includes(envs, path) && fs.existsSync(path)) {
    envs.push(path);
  }
}

function getCondaPath() {
  return path.join(__dirname.split('app.asar')[0], 'conda');
}

function getPythonPath() {
  return path.join(__dirname.split('app.asar')[0], 'conda', 'python.exe');
}

function getStartKernelPath() {
  return path.join(__dirname.split('app.asar')[0], 'kernels', 'python', 'start_kernel.py');
}

function setDefaultEnvVars(env) {
  if (_.isString(env.PATH) && process.platform === 'darwin') {
    const splitter = ':',
      envs = env.PATH.split(splitter);

    addPath(envs, '/sbin');
    addPath(envs, '/usr/sbin');
    addPath(envs, '/usr/local/bin');

    env.PATH = envs.join(splitter);
  }

  return _.assign({
    PYTHONUNBUFFERED: '1'
  }, env);
}

module.exports.toPythonArgs = toPythonArgs;
module.exports.setDefaultEnvVars = setDefaultEnvVars;
module.exports.getStartKernelPath = getStartKernelPath;
module.exports.getPythonPath = getPythonPath;
module.exports.getCondaPath = getCondaPath;
