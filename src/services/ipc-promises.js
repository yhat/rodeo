const _ = require('lodash'),
  bluebird = require('bluebird'),
  log = require('./log').asInternal(__filename);

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
      if (_.isError(data)) {
        log('error', 'event failed', id, name, data);
        event.sender.send(replyName, id, {name: data.name, message: data.message});
      } else {
        log('info', 'event succeeded', id, name, data);
        event.sender.send(replyName, id, null, data);
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
    const name = _.snakeCase(fn.name.replace(/^on/, ''));

    log('info', 'exposeElectronIpcEvents exposing', name);

    ipcEmitter.on(name, function (event, id) {
      try {
        const args = _.slice(arguments, 2);

        log('info', 'responding to ipc event', id, name, args);
        bluebird.method(fn.bind(event.sender)).apply(null, args)
          .then(replyToEvent(name, id, event))
          .catch(replyToEvent(name, id, event));
      } catch (ex) {
        log('error', 'failed to wait for reply to event', id, name, event, ex);
      }
    });
  });
}

module.exports.exposeElectronIpcEvents = exposeElectronIpcEvents;