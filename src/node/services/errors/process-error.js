import _ from 'lodash';

/**
 * @param {string} message
 * @param {object} properties
 * @constructor
 */
function ProcessError(message, properties) {
  const error = Error.call(this, message);

  this.name = 'ProcessError';
  this.message = error.message;
  this.stack = error.stack;
  _.assign(this, properties);
}
ProcessError.prototype = Object.create(Error.prototype);
ProcessError.prototype.constructor = ProcessError;

export default ProcessError;
