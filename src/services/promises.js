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

/**
 * Only one item per key will exist or can be requested.  If the item is being created, others will wait as well.
 * @param {object} list  list of items that can only exist once
 * @param {string} key  identifier
 * @param {function} fn  creation function
 * @returns {Promise}
 */
function promiseOnlyOne(list, key, fn) {
  let promise = list[key];

  if (promise) {
    return promise;
  } else {
    promise = bluebird.try(fn);
    list[key] = promise;
    return promise;
  }
}

module.exports.eventsToPromise = eventsToPromise;
module.exports.promiseOnlyOne = promiseOnlyOne;