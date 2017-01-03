/**
 * Things related directly to the format of the language interpreters or language
 * @module
 */

import _ from 'lodash';
import path from 'path';
import envService from '../../services/env';

const resourcesPath = process.resourcesPath,
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

  log('info', 'setDefaultEnvVars', env);

  if (process.platform === 'darwin') {
    envService.appendToPath(env, '/sbin');
    envService.appendToPath(env, '/usr/sbin');
    envService.appendToPath(env, '/usr/local/bin');
  }

  return setPythonConstants(env);
}

function setBuiltinDefaultEnvVars(env) {
  if (process.resourcesPath) {
    log('info', 'setBuiltinDefaultEnvVars', env);

    if (!env.PATH && !env.Path) {
      throw new Error('MISSING PATH in setBuiltinDefaultEnvVars');
    }

    envService.appendToPath(env, path.join(process.resourcesPath, 'conda'));
    envService.appendToPath(env, path.join(process.resourcesPath, 'conda', 'bin'));
    envService.appendToPath(env, path.join(process.resourcesPath, 'conda', 'Lib'));
    envService.appendToPath(env, path.join(process.resourcesPath, 'conda', 'Lib', 'bin'));
    envService.appendToPath(env, path.join(process.resourcesPath, 'conda', 'Scripts'));
    envService.appendToPath(env, path.join(process.resourcesPath, 'conda', 'Scripts', 'bin'));

    envService.appendToPath(env, path.join(process.resourcesPath, 'conda', 'DLLs'), 'pythonPath');
    envService.appendToPath(env, path.join(process.resourcesPath, 'conda', 'Lib'), 'pythonPath');
    envService.appendToPath(env, path.join(process.resourcesPath, 'conda', 'Lib', 'site-packages'), 'pythonPath');
  }

  return env;
}

function setPythonConstants(env) {
  if (!env.PYTHONUNBUFFERED) {
    env.PYTHONUNBUFFERED = '1';
  }

  if (!env.PYTHONIOENCODING) {
    env.PYTHONIOENCODING = 'utf-8';
  }

  return env;
}

function extendOwnEnv() {
  if (process.resourcesPath) {
    envService.appendToPath(process.env, path.join(process.resourcesPath, 'conda'));
  }

  if (process.platform !== 'win32') {
    envService.appendToPath(process.env, '/sbin');
    envService.appendToPath(process.env, '/usr/sbin');
    envService.appendToPath(process.env, '/usr/local/bin');
  }

  return setPythonConstants(process.env);
}

export default {
  extendOwnEnv,
  getStartKernelPath,
  getPythonPath,
  getCondaPath,
  setBuiltinDefaultEnvVars,
  setDefaultEnvVars,
  toPythonArgs
};
