/**
 * This has to be unique between clients, which is different than the cid.
 * @module
 */

/**
 * @returns {string}
 */
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

export default (function () {
  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };
}());
