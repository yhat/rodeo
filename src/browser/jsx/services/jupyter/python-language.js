import _ from 'lodash';

/**
 * @param {object} args
 * @returns {object}
 */
function toPythonArgs(args) {
  return _.reduce(args, function (obj, value, key) {
    obj[_.snakeCase(key)] = value;
    return obj;
  }, {});
}

export default {
  toPythonArgs
};
