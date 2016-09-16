import _ from 'lodash';
let Store;

/**
 * Prevent myself from being inconsistent as I change between languages.
 * @param {string|undefined} key
 */
function assertCamelCase(key) {
  if (_.isString(key) && _.camelCase(key) !== key) {
    throw new Error('key ' + key + ' should be ' + _.camelCase(key));
  }
}

Store = (function () {
  let source;

  const constructor = function (storageSource) {
    source = storageSource;
  };

  constructor.prototype = {
    get(key) {
      assertCamelCase(key);
      let result = source.getItem(key);

      if (typeof result === 'string') {
        try {
          result = JSON.parse(result);
        } catch (ex) {
          // we're okay with this
        }
      }
      return result;
    },

    set(key, value) {
      assertCamelCase(key);
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      source.setItem(key, value);
    },

    setSource(storageSource) {
      source = storageSource;
    }
  };

  return constructor;
}());

export const local = new Store(window.localStorage),
  session = new Store(window.sessionStorage);
export default {
  local,
  session,
  Store
};
