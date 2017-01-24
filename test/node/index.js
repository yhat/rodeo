const bluebird = require('bluebird'),
  chai = require('chai'),
  electron = require('electron'),
  ipcMainRemote = electron.remote.ipcMain;

// output the logs to the console when running tests (in karma)
ipcMainRemote.on('console-log', function (event, msg) {
  console.log(msg);
});

bluebird.config({
  warnings: true,
  longStackTraces: true,
  cancellation: true,
  monitoring: false
});

// defaults for chai
chai.config.showDiff = true;
chai.config.truncateThreshold = 0;

// jquery sees module and thinks it's not a browser
window.$ = window.jQuery = require('../../node_modules/jquery/dist/jquery');
