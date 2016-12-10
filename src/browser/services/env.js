import _ from 'lodash';
import api from './api';
import bluebird from 'bluebird';
import {local, session} from './store';
import os from 'os';
import path from 'path';

const rootAppDir = process.resourcesPath,
  condaDirName = 'conda',
  condaDir = path.join(rootAppDir, condaDirName),
  dllDir = path.join(rootAppDir, condaDirName, 'DLLs'),
  libDir = path.join(rootAppDir, condaDirName, 'Lib'),
  sitePackagesDir = path.join(rootAppDir, condaDirName, 'Lib', 'site-packages'),
  scriptsDir = path.join(rootAppDir, condaDirName, 'Scripts');

console.log({rootAppDir, condaDirName, condaDir, libDir, scriptsDir, dirname: __dirname});

function splitList(list) {
  if (process.platform === 'win32') {
    return list.split(';');
  } else {
    return list.split(':');
  }
}

function joinList(list) {
  if (process.platform === 'win32') {
    return list.join(';');
  } else {
    return list.join(':');
  }
}

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

function applyBuiltinPython(env) {
  const useBuiltinPython = local.get('useBuiltinPython') || 'failover',
    hasPythonFailedOver = session.get('hasPythonFailedOver') || false,
    hasPythonPath = env.PYTHONPATH;

  if (!hasPythonPath || useBuiltinPython === 'yes' || (hasPythonFailedOver && useBuiltinPython === 'failover')) {
    addOurPythonPath(env);
    env = prependBuiltinPath(env);
  }

  return env;
}

function getEnvironmentVariables(env) {
  if (!env) {
    env = local.get('environmentVariables');
  }

  if (env) {
    return bluebird.resolve(applyBuiltinPython(env));
  }

  return api.send('getEnvironmentVariables').then(function (env) {
    if (_.size(env) < 10) {
      console.log('failed to get terminal environment variables, using Rodeo\'s environment variables', {env});
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
    result = splitList(path);
  } else {
    result = [];
  }

  return result;
}

function setExistingPath(env, value) {
  if (env.PATH) {
    delete value.PATH;
  } else if (env.Path) {
    delete value.Path;
  } else if (env.path) {
    delete env.path;
  }

  env.PATH = value;

  return env;
}

function setPath(env, newPath) {
  let result;

  if (_.isArray(newPath)) {
    result = joinList(newPath);

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
