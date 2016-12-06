import _ from 'lodash';
import api from './api';
import bluebird from 'bluebird';
import {local, session} from './store';
import os from 'os';
import path from 'path';

const rootAppDir = process.resourcesPath,
  condaDirName = 'conda',
  condaDir = path.join(rootAppDir, condaDirName),
  libDir = path.join(rootAppDir, condaDirName, 'Lib'),
  scriptsDir = path.join(rootAppDir, condaDirName, 'Scripts');

console.log({rootAppDir, condaDirName, condaDir, libDir, scriptsDir, dirname: __dirname});

function prependToPath(fullPath, pathPart) {
  if (!_.includes(fullPath, pathPart)) {
    fullPath.unshift(pathPart);
  }
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

  prependToPath(myPath, condaDir);
  prependToPath(myPath, libDir);
  prependToPath(myPath, scriptsDir);

  return setPath(env, myPath);
}

function applyBuiltinPython(env) {
  const useBuiltinPython = local.get('useBuiltinPython') || 'failover',
    hasPythonFailedOver = session.get('hasPythonFailedOver') || false;

  if (useBuiltinPython === 'yes' || (hasPythonFailedOver && useBuiltinPython === 'failover')) {
    env = prependBuiltinPath(env);
  }

  return env;
}

function getEnvironmentVariables(env) {

  console.log('what, HUH?', env);

  if (!env) {
    env = local.get('environmentVariables');
    console.log('wait, WHY?', env);
  }

  if (env) {
    return bluebird.resolve(applyBuiltinPython(env));
  }

  return api.send('getEnvironmentVariables').then(function (env) {
    if (_.size(env) < 10) {
      const returnedEnv = env;

      env = _.clone(process.env);
      console.log('failed to get terminal environment variables, using Rodeo\'s environment variables', {returnedEnv, env});
    }

    // bonus variables are used by various python packages, but it's okay for the user to see and change them
    env = addBonusVariables(env);
    // save the version without any modifications, because they can change their preferences at any time
    local.set('environmentVariables', env);
    return applyBuiltinPython(env);
  });
}

function getPath(env) {
  const path = env.PATH || env.Path || env.path;
  let result;

  if (path) {
    if (process.platform === 'win32') {
      result = path.split(';');
    } else {
      result = path.split(':');
    }
  } else {
    result = [];
  }

  return result;
}

function setExistingPath(env, value) {
  if (env.PATH) {
    env.PATH = value;
  } else if (env.Path) {
    env.Path = value;
  } else if (env.path) {
    env.path = value;
  } else {
    // most OS's use all capitals, and if this is not set, the user has done something WEIRD
    env.PATH = value;
  }

  return env;
}

function setPath(env, newPath) {
  let result;

  if (_.isArray(newPath)) {
    if (process.platform === 'win32') {
      result = newPath.join(';');
    } else {
      result = newPath.join(':');
    }

    env = setExistingPath(env, result);
    local.set('environmentVariables', env);
  }

  return env;
}

export default {
  getEnvironmentVariables,
  getPath,
  setPath
};
