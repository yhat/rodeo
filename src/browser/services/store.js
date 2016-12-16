import _ from 'lodash';
let Store;

/**
 * Prevent myself from being inconsistent as I change between languages.
 * @param {string|undefined} key
 */
function assertCamelCase(key) {
  if (!_.isString(key)) {
    throw new Error('key must be a string');
  } else if (_.isString(key) && _.camelCase(key) !== key) {
    throw new Error('key ' + key + ' should be ' + _.camelCase(key));
  }
}

Store = (function () {
  return function (name, source) {
    Object.defineProperty(this, 'name', {get: () => source});
    Object.defineProperty(this, 'source', {get: () => source});

    this.get = function (key) {
      assertCamelCase(key);
      let value = source.getItem(key);

      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (ex) {
          // we're okay with this
        }
      }

      return value;
    };

    this.set = function (key, value) {
      assertCamelCase(key);

      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }

      source.setItem(key, value);
    };

    this.clear = function () {
      // try to preserve userId, no matter what
      const userIdKey = 'userId';
      let userId;

      try {
        userId = this.get(userIdKey);
      } catch (ex) {
        // noop
      }

      source.clear();

      if (userId) {
        this.set(userIdKey, userId);
      }
    };

    this.setSource = function (storageSource) {
      source = storageSource;
    };
  };
}());

export const local = new Store('local', window.localStorage),
  session = new Store('session', window.sessionStorage);
export default {
  local,
  session,
  Store
};
