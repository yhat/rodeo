/**
 * Electron stuff goes on the outside
 *
 * @module
 * @author Dane Stuckel <dane@yhathq.com>
 */
const ipc = (function () {
  const ipcRenderer = require('electron').ipcRenderer,
    cid = (function () {
      var i = 0;

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

  function isPromise(obj) {
    return typeof obj === 'object' && obj !== null &&
      typeof obj.then === 'function' &&
      typeof obj.catch === 'function';
  }

  /**
   * @param {string} eventName
   * @param {function} eventFn
   * @returns {*}}
   */
  function on(eventName, eventFn) {
    var eventReplyName = eventName + '_reply';

    try {
      ipcRenderer.on(eventName, function (event, eventId) {
        var endTime,
          startTime = new Date().getTime(),
          args = Array.prototype.slice.call(arguments, 2),
          eventResult = eventFn.apply(null, [event].concat(args));

        if (isPromise(eventResult)) {
          eventResult.then(function(result) {
            endTime = (new Date().getTime() - startTime);
            console.log('ipc: completed promise successfully', endTime + 'ms', eventReplyName, eventId);
            ipcRenderer.send(eventReplyName, eventId, null, result);
          }).catch(function (error) {
            endTime = (new Date().getTime() - startTime);
            console.log('ipc: completed promise with error', endTime + 'ms', eventReplyName, eventId);
            ipcRenderer.send(eventReplyName, eventId, error);
          });
        } else {
          endTime = (new Date().getTime() - startTime);
          console.log('ipc: completed', endTime + 'ms', eventName, eventId);
          ipcRenderer.send(eventReplyName, eventId, null, eventResult);
        }
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
  function send() {
    var eventId = cid().toString(),
      startTime = new Date().getTime(),
      args = toArgs(arguments),
      eventName = args[0];

    return new Promise(function (resolve, reject) {
      // noinspection JSDuplicatedDeclaration
      var response,
        eventReplyName = eventName + '_reply',
        timer = setInterval(function () {
          console.warn('ipc ' + eventId + ': still waiting for', eventName);
        }, 1000);

      ipcRenderer.send.apply(ipcRenderer, [eventName, eventId].concat(args.slice(1)));
      response = function (event, id) {
        var result, endTime;

        if (id === eventId) {
          ipcRenderer.removeListener(eventReplyName, response);
          clearInterval(timer);
          result = toArgs(arguments).slice(2);
          endTime = (new Date().getTime() - startTime);

          if (result[0]) {
            console.log('ipc ' + eventId + ': error', endTime + 'ms', result[0]);
            reject(new Error(result[0].message));
          } else {
            console.log('ipc ' + eventId + ': completed', endTime + 'ms', result[1]);
            resolve(result[1]);
          }
        } else {
          console.log('ipc ' + eventId + ':', eventName, id, 'is not for us.');
        }
      };
      console.log('ipc ' + eventId + ': waiting for ', eventName, 'on', eventReplyName);
      ipcRenderer.on(eventReplyName, response);
    });
  }

  return {on, send};
}());
