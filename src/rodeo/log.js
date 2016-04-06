'use strict';

const _ = require('lodash'),
  chalk = require('chalk'),
  path = require('path'),
  winston = require('winston'),
  util = require('util'),
  logLevel = process.env.LOG || 'info',
  transports = [
    new winston.transports.Console({
      level: logLevel
    }),
    new winston.transports.File({
      filename: 'rodeo.log',
      level: logLevel
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

/**
 * @param {string} dirname
 * @returns {Function}
 */
module.exports.withPrefix = function (dirname) {
  const prefix = path.relative(process.cwd(), dirname).replace(/\.js$/, '').replace(/^[\.]\.\//, '');

  return function (type) {
    winston.log(type, _.reduce(_.slice(arguments, 1), function (list, value) {
      if (isError(value)) {
        list.push(value.stack);
      } else if (_.isObject(value)) {
        list.push(util.inspect(value, {showHidden: true, depth: 10}));
      } else {
        list.push(value + '');
      }

      return list;
    }, [chalk.blue(prefix + '::')]).join(' '));
  };
};