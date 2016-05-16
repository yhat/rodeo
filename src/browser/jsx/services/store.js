import _ from 'lodash';

/**
 * Prevent myself from being inconsistent as I change between languages.
 * @param {string|undefined} key
 */
function assertCamelCase(key) {
  if (_.isString(key) && _.camelCase(key) !== key) {
    throw new Error('key ' + key + ' should be ' + _.camelCase(key));
  }
}

export function get(key) {
  assertCamelCase(key);
  let result = window.localStorage.getItem(key);

  if (result) {
    try {
      result = JSON.parse(result);
    } catch (ex) {
      // we're okay with this
    }
  }
  return result;
}

export function set(key, value) {
  assertCamelCase(key);
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  window.localStorage.setItem(key, value);
}

export default {
  get,
  set
};
