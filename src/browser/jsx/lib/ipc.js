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
            if (endTime > 30) {
              console.log('ipc', eventId + ':', eventName + 'completed', endTime + 'ms', {args, result});
            }
            ipcRenderer.send(eventReplyName, eventId, null, result);
          }).catch(function (error) {
            endTime = (new Date().getTime() - startTime);
            console.log('ipc', eventId + ':', eventName + ' error', endTime + 'ms', {args, error});
            ipcRenderer.send(eventReplyName, eventId, error);
          });
        } else {
          endTime = (new Date().getTime() - startTime);
          if (endTime > 30) {
            console.warn('ipc', eventId + ':', eventName + ' completed but was slow', endTime + 'ms', {args, result: eventResult});
          }

          ipcRenderer.send(eventReplyName, eventId, null, eventResult);
        }
      });
      console.log('ipc listening for', eventName, eventFn.name);
      return this;
    } catch (ex) {
      console.error('ipc error', eventName, ex);
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
        count = 10,
        eventReplyName = eventName + '_reply',
        timer = setInterval(function () {
          if (count > 0) {
            return console.warn('ipc ' + eventId + ': still waiting for', eventName, {args});
          }

          console.warn('ipc ' + eventId + ': timed out waiting for', eventName, {args});
          clearInterval(timer);
        }, 10000);

      ipcRenderer.send.apply(ipcRenderer, [eventName, eventId].concat(args.slice(1)));
      response = function (event, id) {
        var result, endTime;

        if (id === eventId) {
          ipcRenderer.removeListener(eventReplyName, response);
          clearInterval(timer);
          result = toArgs(arguments).slice(2);
          endTime = (new Date().getTime() - startTime);

          if (result[0]) {
            console.log('ipc', eventId + ':', eventName + ' error', endTime + 'ms', {args, result: result[0]});
            reject(new Error(result[0].message));
          } else {
            if (endTime > 30) {
              console.warn('ipc', eventId + ':', eventName + ' completed but was slow', endTime + 'ms', {args, result: result[1]});
            }

            resolve(result[1]);
          }
        }
      };
      ipcRenderer.on(eventReplyName, response);
    });
  }

  return {on, send};
}());
