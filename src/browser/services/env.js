import _ from 'lodash';
import api from './api';
import bluebird from 'bluebird';
import clientDiscovery from './jupyter/client-discovery';
import {local, session} from './store';
import os from 'os';
import path from 'path';
import {getKeyMap, joinList, splitList, getPath, setPath} from '../../shared/env';

const storeKey = 'environmentVariables',
  rootAppDir = process.resourcesPath,
  condaDirName = 'conda',
  condaDir = path.join(rootAppDir, condaDirName),
  dllDir = path.join(rootAppDir, condaDirName, 'DLLs'),
  libDir = path.join(rootAppDir, condaDirName, 'Lib'),
  sitePackagesDir = path.join(rootAppDir, condaDirName, 'Lib', 'site-packages'),
  scriptsDir = path.join(rootAppDir, condaDirName, 'Scripts');

/**
 * If the pathPart already exists, move it to the start.
 * If it doesn't exist yet, add it to the start.
 * @param {Array} fullPath
 * @param {string} pathPart
 */
function prependToPath(fullPath, pathPart) {
  const index = fullPath.indexOf(pathPart);

  if (index > -1) {
    fullPath.splice(index, 1);
  }

  fullPath.unshift(pathPart);
}

function addBonusVariables(env) {
  // Windows sometimes doesn't provide this variable, but some python packages require it
  if (process.platform === 'win32') {
    if (!env.NUMBER_OF_PROCESSORS) {
      try {
        env.NUMBER_OF_PROCESSORS = os.cpus().length;
      } catch (ex) {
        console.warn('warn', 'failed to set NUMBER_OF_PROCESSORS', ex);
      }
    }
  }

  // we support colors by default
  if (process.platform !== 'win32' && env.CLICOLOR === undefined) {
    env.CLICOLOR = 1;
  }

  return env;
}

function prependBuiltinPath(env) {
  const myPath = getPath(env);

  prependToPath(myPath, scriptsDir);
  prependToPath(myPath, libDir);
  prependToPath(myPath, condaDir);

  return setPath(env, myPath);
}

function addOurPythonPath(env) {
  if (process.platform === 'win32') {
    const list = env.PYTHONPATH ? splitList(env.PYTHONPATH) : [];

    prependToPath(list, sitePackagesDir);
    prependToPath(list, libDir);
    prependToPath(list, dllDir);

    env.PYTHONPATH = joinList([dllDir, libDir, sitePackagesDir], list);
  }

  return env;
}

function applyAdditionalOverrides(env) {
  const additionalPath = local.get('additionalEnvironmentVariablePath'),
    additionalPythonPath = local.get('additionalEnvironmentVariablePythonPath'),
    overriddenEnv = local.get('overriddenEnvironmentVariables'),
    currentPath = getPath(env, 'path') || [],
    currentPythonPath = getPath(env, 'pythonPath') || [];

  if (additionalPath) {
    setPath(env, additionalPath.concat(currentPath), 'path');
  }

  if (additionalPythonPath) {
    setPath(env, additionalPythonPath.concat(currentPythonPath), 'pythonPath');
  }

  if (overriddenEnv) {
    env = _.assign({}, overriddenEnv, env);
  }

  return env;
}

function applyBuiltinPython(env) {
  if (clientDiscovery.shouldUseBuiltinPython()) {
    env = addOurPythonPath(env);
    env = prependBuiltinPath(env);
  }

  return env;
}

/**
 * Best attempt to get value in a synchronous way
 * @returns {object}
 */
function getEnvironmentVariablesRaw() {
  return session.get(storeKey);
}

function getEnvironmentVariables(env) {
  if (!env) {
    env = session.get(storeKey);
  }

  if (env) {
    env = applyAdditionalOverrides(env);
    return bluebird.resolve(applyBuiltinPython(env));
  }

  return api.send('getEnvironmentVariables').then(function (env) {
    if (_.size(env) < 10) {
      console.log('failed to get terminal environment variables, using Rodeo\'s environment variables', {env});
    }

    // bonus variables are used by various python packages, but it's okay for the user to see and change them
    env = addBonusVariables(env);
    // save the version without any modifications, because they can change their preferences at any time
    session.set(storeKey, env);
    env = applyAdditionalOverrides(env);
    return applyBuiltinPython(env);
  });
}

export default {
  getEnvironmentVariablesRaw,
  getEnvironmentVariables,
  getKeyMap,
  getPath,
  setPath
};
