'use strict';

/**
 * Wrapper around ipcRenderer so we can wrap it later with something else
 * @type {{send: function}}
 */
var ipc = window.ipc = (function () {
  var cid = (function () { var i = 0; return function () { return i++; }; }()),
    ipcRender = require('electron').ipcRenderer;

  function toArgs(obj) {
    return Array.prototype.slice.call(obj, 0);
  }

  function on(emitter) {
    return function (eventName, eventFn) {
      try {
        emitter.on(eventName, function () {
          var eventResult,
            eventArgs = toArgs(arguments);

          eventResult = eventFn.apply(null, eventArgs);
          console.log('ipc event trigger completed', eventName, eventResult);
          return eventResult;
        });
        console.log('ipc event registered', eventName, eventFn.name);
        return emitter;
      } catch (ex) {
        console.error('ipc event error', eventName, ex);
      }
    };
  }

  function send(emitter) {
    return function () {
      var eventId = cid().toString(),
        args = toArgs(arguments),
        eventName = args[0];

      return new Promise(function (resolve, reject) {
        var response,
          eventReplyName = eventName + '_reply';

        console.log('ipc sending', [eventName, eventId].concat(args.slice(1)));
        emitter.send.apply(emitter, [eventName, eventId].concat(args.slice(1)));
        response = function (event, id) {
          let result;
          if (id === eventId) {
            ipcRender.removeListener(eventReplyName, response);
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
        ipcRender.on(eventReplyName, response);
      });
    };
  }

  return {
    send: send(ipcRender),
    on: on(ipcRender)
  };
}());