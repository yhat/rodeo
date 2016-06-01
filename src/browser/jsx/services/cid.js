/**
 * This has to be unique within a particular client, so simple counting will do.
 * @module
 */

/**
 * @returns {function}
 */
export default (function () {
  let i = 0;

  return function () {
    if (i == Number.MAX_SAFE_INTEGER) {
      i = 0;
    }
    return 'cid-' + (i++).toString(36);
  };
}());
