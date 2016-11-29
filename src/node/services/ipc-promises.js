'use strict';

import _ from 'lodash';
import bluebird from 'bluebird';

const log = require('./log').asInternal(__filename);

/**
 * @param {string} name
 * @param {string} id
 * @param {Event} event
 * @returns {function}
 */
function replyToEvent(name, id, event) {
  const replyName = name + '_reply';

  return function (data) {
    try {
      if (!event.sender.isDestroyed()) {
        if (_.isError(data)) {
          event.sender.send(replyName, id, {name: data.name, message: data.message});
        } else {
          event.sender.send(replyName, id, null, data);
        }
      } else {
        log('info', 'did not reply to event because sender is destroyed', id, name);
      }
    } catch (ex) {
      log('error', 'failed to reply to event', id, name, data, ex);
    }
  };
}

/**
 * Standardize our naming by forcing a convention.
 *
 * Take a list of functions and bind them to events of the exact same name in snake_case.
 *
 * The other side should be listening for a reply with the same requestId that follows
 * the node convention of (err, data)
 *
 * This is important because there are a lot of ways for functions to fail with these events, so having a standard
 * way to catch these errors is useful for maintainability
 *
 * @param {EventEmitter} ipcEmitter
 * @param {[function]} list
 */
function exposeElectronIpcEvents(ipcEmitter, list) {
  _.each(list, function (fn) {
    const name = _.camelCase(fn.name.replace(/^on/, ''));

    ipcEmitter.on(name, function (event, id) {
      try {
        const args = _.slice(arguments, 2);

        bluebird.try(() => fn.apply(event.sender, args))
          .then(replyToEvent(name, id, event))
          .catch(replyToEvent(name, id, event));
      } catch (ex) {
        log('error', 'failed to wait for reply to event', id, name, event, ex);
      }
    });
  });
}

module.exports.exposeElectronIpcEvents = exposeElectronIpcEvents;
