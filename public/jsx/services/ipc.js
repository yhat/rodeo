/* eslint no-console: 0 */
import { ipcRenderer } from 'electron';

const registeredActions = {};

let cid = (function () {
  let i = 0;

  return function () {
    return i++;
  };
}());

/**
 * @param {Arguments} obj
 * @param {number} [num=0]
 * @returns {Array}
 */
function toArgs(obj, num) {
  return Array.prototype.slice.call(obj, num || 0);
}

/**
 * @param {string} eventName
 * @param {function} eventFn
 * @returns {*}}
 */
export function on(eventName, eventFn) {
  try {
    ipcRenderer.on(eventName, function (event, result) {
      let eventResult;
      
      eventResult = eventFn.call(null, event, result);

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