'use strict';

const EventEmitter = require('events');

class MockChildProcess extends EventEmitter {
  constructor(options) {
    options = options || {};
    super();
    this.pid = options.pid || '123';
  }
  kill() {
    this.emit('close', 'a', 'b');
  }
}

module.exports = MockChildProcess;