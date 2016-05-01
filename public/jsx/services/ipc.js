/* eslint no-console: 0 */
import {ipcRenderer} from 'electron';

let cid = (function () {
  let i = 0;

  return function () {
    return i++;
  };
}());

/**
 * @param {Arguments} obj
 * @returns {Array}
 */
function toArgs(obj) {
  return Array.prototype.slice.call(obj, 0);
}

/**
 * @param {string} eventName
 * @param {function} eventFn
 * @returns {*}}
 */
export function on(eventName, eventFn) {
  try {
    ipcRenderer.on(eventName, function () {
      let eventResult,
        eventArgs = toArgs(arguments);

      eventResult = eventFn.apply(null, eventArgs);
      console.log('ipc event trigger completed', eventName, eventResult);
      return eventResult;
    });
    console.log('ipc event registered', eventName, eventFn.name);
    return this;
  } catch (ex) {
    console.error('ipc event error', eventName, ex);
  }
}

/**
 * @returns {Promise}
 */
export function send() {

  let eventId = cid().toString(),
    args = toArgs(arguments),
    eventName = args[0];

  return new Promise(function (resolve, reject) {
    // noinspection JSDuplicatedDeclaration
    let response,
      eventReplyName = eventName + '_reply';

    console.log('ipc sending', [eventName, eventId].concat(args.slice(1)));
    ipcRenderer.send.apply(ipcRenderer, [eventName, eventId].concat(args.slice(1)));
    response = function (event, id) {
      let result;

      if (id === eventId) {
        ipcRenderer.removeListener(eventReplyName, response);
        result = toArgs(arguments).slice(2);
        if (result[0]) {
          reject(new Error(result[0].message));
        } else {
          resolve(result[1]);
        }
      } else {
        console.log(eventName, eventId, 'passed on', arguments);
      }
    };
    console.log('ipc waiting for ', eventName, eventId, 'on', eventReplyName);
    ipcRenderer.on(eventReplyName, response);
  });

}