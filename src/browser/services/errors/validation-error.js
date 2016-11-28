import _ from 'lodash';

function ValidationError(message, properties) {
  const error = Error.call(this, message);

  this.name = 'ValidationError';
  this.message = error.message;
  this.stack = error.stack;
  _.assign(this, properties);
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

export default ValidationError;
