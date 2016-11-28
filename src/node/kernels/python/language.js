/**
 * Things related directly to the format of the language interpreters or language
 * @module
 */

'use strict';

const _ = require('lodash'),
  fs = require('fs'),
  os = require('os'),
  log = require('../../services/log').asInternal(__filename),
  path = require('path');

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

function getLibPath() {
  return path.join(__dirname.split('app.asar')[0], 'conda', 'Lib');
}

function getScriptsPath() {
  return path.join(__dirname.split('app.asar')[0], 'conda', 'Scripts');
}

function getStartKernelPath() {
  return path.join(__dirname.split('app.asar')[0], 'kernels', 'python', 'start_kernel.py');
}

function setDefaultEnvVars(env) {
  if (_.isString(env.PATH)) {
    if (process.platform === 'darwin') {
      const splitter = ':',
        envs = env.PATH.split(splitter);

      addPath(envs, '/sbin');
      addPath(envs, '/usr/sbin');
      addPath(envs, '/usr/local/bin');

      env.PATH = envs.join(splitter);
    } else if (process.platform === 'win32') {
      const splitter = ';',
        envs = env.PATH.split(splitter);

      addPath(envs, getCondaPath());
      addPath(envs, getLibPath());
      addPath(envs, getScriptsPath());

      env.PATH = envs.join(splitter);
    }
  }

  if (process.platform === 'win32') {
    if (!env.NUMBER_OF_PROCESSORS) {
      try {
        env.NUMBER_OF_PROCESSORS = os.cpus().length;
      } catch (ex) {
        log('warn', 'failed to set NUMBER_OF_PROCESSORS', ex);
      }
    }
  }

  // we support colors
  if (process.platform !== 'win32' && env.CLICOLOR === undefined) {
    env.CLICOLOR = 1;
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
