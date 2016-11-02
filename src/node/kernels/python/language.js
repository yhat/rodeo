/**
 * Things related directly to the format of the language interpreters or language
 * @module
 */

'use strict';

const _ = require('lodash'),
  fs = require('fs'),
  os = require('os'),
  log = require('../../services/log').asInternal(__filename);

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

function setDefaultEnvVars(env) {
  if (process.platform === 'darwin' && _.isString(env.PATH)) {
    if (_.isString(env.PATH)) {
      const envs = env.PATH.split(':');

      addPath(envs, '/sbin');
      addPath(envs, '/usr/sbin');
      addPath(envs, '/usr/local/bin');

      env.PATH = envs.join(':');
    }
  }

  // we support colors
  if (process.platform !== '32' && env.CLICOLOR === undefined) {
    env.CLICOLOR = 1;
  }

  if (process.platform === 'win32' && !env.NUMBER_OF_PROCESSORS) {
    try {
      env.NUMBER_OF_PROCESSORS = os.cpus().length;
    } catch (ex) {
      log('warn', 'failed to set NUMBER_OF_PROCESSORS', ex);
    }
  }

  return _.assign({
    PYTHONUNBUFFERED: '1'
  }, env);
}

module.exports.toPythonArgs = toPythonArgs;
module.exports.setDefaultEnvVars = setDefaultEnvVars;
