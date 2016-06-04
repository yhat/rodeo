'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird');

/**
 * @param {EventEmitter} eventEmitter
 * @param {{resolve: (string|Array), reject: (string|Array)}} events
 * @param {function} [transform]
 * @returns {Promise}
 */
function eventsToPromise(eventEmitter, events, transform) {
  const rejections = _.isString(events.reject) ? [events.reject] : events.reject,
    resolutions = _.isString(events.resolve) ? [events.resolve] : events.resolve,
    resolveTransform = events.resolveTransform || _.identity,
    rejectTransform = events.rejectTransform || _.identity;

  return new bluebird(function (resolve, reject) {
    // noinspection JSDuplicatedDeclaration
    let resolveReady, rejectError,
      removeListeners = function () {
        rejections.map(name => eventEmitter.removeListener(name, rejectError));
        resolutions.map(name => eventEmitter.removeListener(name, resolveReady));
      };

    resolveReady = function (data, name) {
      resolve(resolveTransform(data, name));
      removeListeners();
    };
    rejectError = function (error, name) {
      reject(rejectTransform(error, name));
      removeListeners();
    };

    rejections.map(name => eventEmitter.on(name, _.partial(rejectError, _, name)));
    resolutions.map(name => eventEmitter.on(name, _.partial(resolveReady, _, name)));
  });
}

module.exports.eventsToPromise = eventsToPromise;
