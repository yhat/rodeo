'use strict';

const store = window.store = (function () {
  function get(key) {
    var result = window.localStorage.getItem(key);

    if (result) {
      try {
        result = JSON.parse(result);
      } catch (ex) {
        // we're okay with this
      }
    }
    return result;
  }

  function set(key, value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    window.localStorage.setItem(key, value);
  }

  return {
    get: get,
    set: set
  };
}());