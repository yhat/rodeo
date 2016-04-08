'use strict';

const chai = require('chai'),
  electron = require('electron'),
  ipcMainRemote = electron.remote.ipcMain;

// output the logs to the console when running tests (in karma)
ipcMainRemote.on('console-log', function (event, msg) {
  console.log(msg);
});

// defaults for chai
chai.config.showDiff = true;
chai.config.truncateThreshold = 0;
