import _ from 'lodash';

export function splitList(list) {
  if (process.platform === 'win32') {
    return list.split(';');
  } else {
    return list.split(':');
  }
}

export function joinList(list) {
  if (process.platform === 'win32') {
    return list.join(';');
  } else {
    return list.join(':');
  }
}

export function getKeyMap(source) {
  return _.reduce(source, (obj, value, key) => {
    obj[key.toUpperCase()] = key;

    return obj;
  }, {});
}

/**
 * @param {object} env
 * @param {string} [keyName='PATH']
 * @returns {Array}
 */
export function getPath(env, keyName) {
  keyName = keyName && keyName.toUpperCase() || 'PATH';
  const keyMap = getKeyMap(env),
    path = env[keyMap[keyName]];

  return path ? splitList(path) : [];
}

/**
 * @param {object} env
 * @param {Array} newPath
 * @param {string} [keyName='PATH']
 * @returns {object}
 * @example setPath(process.env, '/usr/local/bin', 'MANPATH')
 */
export function setPath(env, newPath, keyName) {
  keyName = keyName && keyName.toUpperCase() || 'PATH';
  const keyMap = getKeyMap(env);

  if (_.isArray(newPath)) {
    let key = keyMap[keyName] || keyName;

    env[key] = joinList(newPath);
  }

  return env;
}
