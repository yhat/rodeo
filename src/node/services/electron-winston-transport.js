import util from 'util';
import winston from 'winston';

let ElectronLogger = function (options) {
  this.name = 'electronLogger';
  this.level = options.level || 'info';
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(ElectronLogger, winston.Transport);

ElectronLogger.prototype.log = function (level, msg, meta, callback) {
  const ipcRenderer = require('electron').ipcRenderer;

  if (ipcRenderer) {
    ipcRenderer.send('console-log', {level, msg, meta});
  }

  //
  // Store this message and metadata, maybe use some custom logic
  // then callback indicating success.
  //
  callback(null, true);
};

export default ElectronLogger;
