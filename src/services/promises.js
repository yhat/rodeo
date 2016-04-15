'use strict';

const bluebird = require('bluebird');

/**
 *
 * @param {EventEmitter} eventEmitter
 * @param {{resolve: string, reject: string}} events
 * @returns {Promise}
 */
function eventsToPromise(eventEmitter, events) {
  return new bluebird(function (resolve, reject) {
    // noinspection JSDuplicatedDeclaration
    let resolveReady, rejectError;

    resolveReady = function (data) {
      resolve(data);
      eventEmitter.removeListener(events.reject, rejectError);
    };
    rejectError = function (error) {
      reject(error);
      eventEmitter.removeListener(events.resolve, resolveReady);
    };
    eventEmitter.once(events.resolve, resolveReady);
    eventEmitter.once(events.reject, rejectError);
  });
}

module.exports.eventsToPromise = eventsToPromise;