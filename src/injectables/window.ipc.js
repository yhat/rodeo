'use strict';

/**
 * @type {{send: function}}
 */
window.ipc = (function () {
  var ipcRender = require('electron').ipcRender;

  return {
    send: function () {
      console.log('send!', arguments);
      ipcRender.send.apply(ipcRender, arguments);
    },
    sendSync: function () {
      console.log('send!', arguments);
      ipcRender.sendSync.apply(ipcRender, arguments);
    },
    on: function () {
      console.log('on!', arguments);
      ipcRender.on.apply(ipcRender, arguments);
    }
  };
}());
