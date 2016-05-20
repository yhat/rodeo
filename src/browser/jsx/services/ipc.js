/* eslint no-console: 0 */
import { ipcRenderer } from 'electron';

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
      let eventResult = eventFn.call(null, event, result);

      console.log('ipc: completed', eventName, eventResult);
      return eventResult;
    });
    console.log('ipc: registered', eventName, eventFn.name);
    return this;
  } catch (ex) {
    console.error('ipc: error', eventName, ex);
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
      eventReplyName = eventName + '_reply',
      timer = setInterval(function () {
        console.warn('ipc ' + eventId + ': still waiting for', eventName);
      }, 1000);

    console.log('ipc ' + eventId + ': sending', [eventName, eventId].concat(args.slice(1)));
    ipcRenderer.send.apply(ipcRenderer, [eventName, eventId].concat(args.slice(1)));
    response = function (event, id) {
      let result;

      if (id === eventId) {
        ipcRenderer.removeListener(eventReplyName, response);
        clearInterval(timer);
        result = toArgs(arguments).slice(2);

        if (result[0]) {
          console.log('ipc ' + eventId + ': completed', result[0]);
          reject(new Error(result[0].message));
        } else {
          console.log('ipc ' + eventId + ': completed', result[1]);
          resolve(result[1]);
        }
      } else {
        console.log('ipc ' + eventId + ':', eventName, 'passed on', arguments);
      }
    };
    console.log('ipc ' + eventId + ': waiting for ', eventName, 'on', eventReplyName);
    ipcRenderer.on(eventReplyName, response);
  });
}

export default {
  on,
  send
};
