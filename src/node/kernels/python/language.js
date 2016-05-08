/**
 * Things related directly to the format of the language interpreters or language
 * @module
 */

'use strict';

const _ = require('lodash');

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

function setDefaultEnvVars(env) {
  return _.assign({
    PYTHONUNBUFFERED: '1'
  }, env);
}

module.exports.toPythonArgs = toPythonArgs;
module.exports.setDefaultEnvVars = setDefaultEnvVars;
