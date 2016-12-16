import _ from 'lodash';
import electronWinstonTransport from './electron-winston-transport';
import path from 'path';
import winston from 'winston';
import util from 'util';
import errorClone from './clone';

const colorize = false;

winston.transports.ElectronLogger = electronWinstonTransport;

let electronTransport = new winston.transports.ElectronLogger({
    level: 'info',
    colorize: false
  }),
  consoleTransport = new winston.transports.Console({
    level: 'info',
    colorize: true
  }),
  fileTransport = new winston.transports.File({
    filename: path.join(require('os').homedir(), 'rodeo.log'),
    level: 'info',
    maxFiles: 2,
    maxsize: 1024 * 1024,
    tailable: true,
    json: false,
    colorize: false,
    prettyPrint: false
  }),
  transports = [
    electronTransport,
    consoleTransport,
    fileTransport
  ],
  logger = new winston.Logger({
    transports: transports,
    exitOnError: false
  });

// stop winston from interfering
winston.exitOnError = false;
winston.handleExceptions(transports);

/**
 * @param {*} obj
 * @returns {boolean}
 */
function isError(obj) {
  return _.isError(obj) || (_.isObject(obj) && obj.stack && _.endsWith(obj.name, 'Error'));
}

function isEventEmitter(obj) {
  return _.isObject(obj) && _.isFunction(obj.on);
}

function isBluebirdPromise(obj) {
  return _.isFunction(obj.then) && _.isFunction(obj.reflect);
}

function isBluebirdPromiseInspection(obj) {
  return _.isFunction(obj.isPending) &&
    _.isFunction(obj.isRejected) &&
    _.isFunction(obj.isFulfilled) &&
    _.isFunction(obj.isCancelled);
}

function transformBluebirdPromise(obj) {
  const fake = {};

  fake.inspect = function () {
    const state = {
      pending: obj.isPending(),
      rejected: obj.isRejected(),
      fulfilled: obj.isFulfilled(),
      cancelled: obj.isCancelled()
    };

    if (state.fulfilled) {
      state.value = obj.value();
    } else if (state.rejected) {
      state.reason = obj.reason();
    }

    return 'Bluebird Promise ' + printObject(state);
  };

  return fake;
}

function isElectronEvent(obj) {
  return _.isObject(obj) && _.isFunction(obj.preventDefault) && !!obj.sender;
}

function transformElectronEvent(obj) {
  const fake = {};

  fake.inspect = function () {
    return 'ElectronEvent ' + printObject({sender: obj.sender});
  };

  return fake;
}

function transformEventEmitter(obj) {
  const fake = {};

  fake.inspect = function () {
    return 'EventEmitter ' + printObject({events: _.pickBy(obj._events, function (value, key) {
      return !_.startsWith(key, 'ATOM');
    })});
  };

  return fake;
}

function printObject(obj) {
  return util.inspect(_.cloneDeep(obj), {depth: 10, colors: colorize});
}

function sanitizeObject(value) {
  if (_.isObject(value)) {
    if (isBluebirdPromise(value) || isBluebirdPromiseInspection(value)) {
      return transformBluebirdPromise(value);
    } else if (_.isBuffer(value)) {
      return value.toString();
    } else if (isError(value)) {
      return printObject(errorClone.toObject(value));
    } else if (isElectronEvent(value)) {
      return transformElectronEvent(value);
    } else if (isEventEmitter(value)) {
      return transformEventEmitter(value);
    } else {
      return _.mapValues(value, sanitizeObject);
    }
  } else {
    return value;
  }
}

/**
 * Standard format for internal logging (non-streaming/non-kernel)
 * @param {string} dirname
 * @returns {Function}
 */
function asInternal(dirname) {
  const prefix = path.relative(process.cwd(), dirname)
    .replace(/\.js$/, '')
    .replace(/^[\.]\.\//, '').replace(/^app\/node\//, '');

  return function (type) {
    exports.log(type, _.reduce(_.slice(arguments, 1), function (list, value) {
      if (_.isObject(value)) {
        list.push(printObject(sanitizeObject(value)));
      } else {
        list.push(value + '');
      }

      return list;
    }, [prefix + '::']).join(' '));
  };
}

module.exports.afterFileTransportFlush = function (fn) {
  fileTransport.on('flush', fn);
};

module.exports.asInternal = asInternal;
module.exports.log = function () { logger.log.apply(logger, _.slice(arguments)); };
