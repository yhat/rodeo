'use strict';

const _ = require('lodash'),
  chalk = require('chalk'),
  electronWinstonTransport = require('./electron-winston-transport'),
  path = require('path'),
  winston = require('winston'),
  util = require('util');

winston.transports.ElectronLogger = electronWinstonTransport;

let logLevel = process.env.RODEO_LOG_LEVEL || 'info',
  transports = [
    new winston.transports.ElectronLogger({
      level: logLevel
    }),
    new winston.transports.Console({
      level: logLevel,
      colorize: true,
      humanReadableUnhandledException: true
    }),
    new winston.transports.File({
      filename: 'rodeo.log',
      level: logLevel,
      maxFiles: 2,
      maxsize: 1024 * 1024,
      tailable: true,
      json: true
    })
  ],
  logger = new winston.Logger({
    transports: transports
  });

winston.handleExceptions(transports);

/**
 * @param {*} obj
 * @returns {boolean}
 */
function isError(obj) {
  return _.isError(obj) || (_.isObject(obj) && obj.stack && _.endsWith(obj.name, 'Error'));
}

function isElectronEvent(obj) {
  return _.isObject(obj) && _.isFunction(obj.preventDefault) && !!obj.sender;
}

function isEventEmitter(obj) {
  return _.isObject(obj) && _.isFunction(obj.on);
}

function isBrowserWindow(obj) {
  return _.isObject(obj) && _.isObject(obj.webContents) && _.isFunction(obj.webContents.send);
}

function isWebContent(obj) {
  return _.isObject(obj) && _.isFunction(obj.send && _.isFunction(obj.printToPDF));
}

function printElectronEvent(obj) {
  return 'ElectronEvent ' + util.inspect({sender: obj.sender}, {colors: true});
}

function printEventEmitter(obj) {
  return 'EventEmitter ' + util.inspect({events: _.pickBy(obj._events, function (value, key) {
    return !_.startsWith(key, 'ATOM');
  })}, {colors: true});
}

function printObject(obj) {
  return util.inspect(obj, {depth: 10, colors: true});
}

/**
 * Standard format for internal logging (non-streaming/non-kernel)
 * @param {string} dirname
 * @returns {Function}
 */
function asInternal(dirname) {
  const prefix = path.relative(process.cwd(), dirname).replace(/\.js$/, '').replace(/^[\.]\.\//, '');

  return function (type) {
    exports.log(type, _.reduce(_.slice(arguments, 1), function (list, value) {
      if (_.isObject(value)) {
        if (_.isBuffer(value)) {
          list.push(value.toString());
        } else if (isError(value)) {
          list.push(value.stack);
        } else if (isBrowserWindow(value) || isWebContent(value)) {
          list.push(printObject(value));
        } else if (isElectronEvent(value)) {
          list.push(printElectronEvent(value));
        } else if (isEventEmitter(value)) {
          list.push(printEventEmitter(value));
        }  else {
          list.push(printObject(value));
        }
      } else {
        list.push(value + '');
      }

      return list;
    }, [chalk.blue(prefix + '::')]).join(' '));
  };
}

module.exports.asInternal = asInternal;
module.exports.log = function () { logger.log.apply(logger, _.slice(arguments)); };