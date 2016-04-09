'use strict';

const _ = require('lodash'),
  chalk = require('chalk'),
  electronWinstonTransport = require('./electron-winston-transport'),
  path = require('path'),
  winston = require('winston'),
  util = require('util');

winston.transports.ElectronLogger = electronWinstonTransport;

let logLevel = process.env.LOG || 'silly',
  transports = [
    new winston.transports.ElectronLogger({
      level: logLevel
    }),
    new winston.transports.Console({
      level: logLevel
    }),
    new winston.transports.File({
      filename: 'rodeo.log',
      level: logLevel,
      maxFiles: 2,
      maxsize: 1024 * 1024,
      tailable: true
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

function isEventEmitter(obj) {
  return _.isObject(obj) && _.isFunction(obj.on);
}

function isBrowserWindow(obj) {
  return _.isObject(obj) && _.isObject(obj.webContents) && _.isFunction(obj.webContents.send);
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
      if (isError(value)) {
        list.push(value.stack);
      } else if (isEventEmitter(value)) {
        list.push('EventEmitter' + util.inspect(value, {showHidden: true, depth: 1}));
      } else if (isBrowserWindow(value)) {
        list.push('BrowserWindow' + util.inspect(value, {showHidden: true, depth: 1}));
      } else if (_.isObject(value)) {
        list.push(util.inspect(value, {showHidden: true, depth: 10}));
      } else {
        list.push(value + '');
      }

      return list;
    }, [chalk.blue(prefix + '::')]).join(' '));
  };
}

module.exports.asInternal = asInternal;
module.exports.log = function () { logger.log.apply(logger, _.slice(arguments)); };