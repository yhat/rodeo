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

class Store {
  constructor(source) {
    this.source = source;
  }

  get(key) {
    assertCamelCase(key);
    let result = this.source.getItem(key);

    if (typeof result === 'string') {
      try {
        result = JSON.parse(result);
      } catch (ex) {
        // we're okay with this
      }
    }
    return result;
  }

  set(key, value) {
    assertCamelCase(key);
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    this.source.setItem(key, value);
  }
}

export const local = new Store(window.localStorage),
  session = new Store(window.sessionStorage);
export default {
  local,
  session,
  Store
};
