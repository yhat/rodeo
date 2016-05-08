const types = {
  info: true,
  debug: true,
  warn: true,
  error: true
};

export function log(type) {
  if (types[type]) {
    /* eslint no-console: 0 */
    console[type].apply(console, Array.prototype.slice.call(arguments, 1));
  }
}

export function asInternal(prefix) {
  return function (type) {
    log.apply(null, [type, prefix].concat(Array.prototype.slice.call(arguments, 1)));
  };
}

export default log;
