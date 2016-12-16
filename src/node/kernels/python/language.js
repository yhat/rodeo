/**
 * Things related directly to the format of the language interpreters or language
 * @module
 */

import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import envService from '../../services/env';

const resourcesPath = process.resourcesPath;

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
  return path.join(resourcesPath, 'conda');
}

function getPythonPath() {
  return path.join(resourcesPath, 'conda', 'python.exe');
}

function getStartKernelPath() {
  return path.join(resourcesPath, 'kernels', 'python', 'start_kernel.py');
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
    PYTHONUNBUFFERED: '1',
    PYTHONIOENCODING: 'utf-8'
  }, env);
}

function extendOwnEnv() {
  if (process.resourcesPath) {
    envService.appendToPath(process.env, path.join(process.resourcesPath, 'conda'));
    envService.appendToPath(process.env, path.join(process.resourcesPath, 'conda', 'bin'));
  }

  if (process.platform !== 'win32') {
    envService.appendToPath(process.env, '/sbin');
    envService.appendToPath(process.env, '/usr/sbin');
    envService.appendToPath(process.env, '/usr/local/bin');
  }

  if (!process.env.PYTHONUNBUFFERED) {
    process.env.PYTHONUNBUFFERED = '1';
  }

  if (!process.env.PYTHONIOENCODING) {
    process.env.PYTHONIOENCODING = 'utf-8';
  }
}

export default {
  extendOwnEnv,
  getStartKernelPath,
  getPythonPath,
  getCondaPath,
  setDefaultEnvVars,
  toPythonArgs
};
