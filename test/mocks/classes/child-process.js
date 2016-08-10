'use strict';

const EventEmitter = require('events'),
  stream = require('stream');

class MockChildProcess extends EventEmitter {
  constructor(options) {
    options = options || {};
    super();
    this.pid = options.pid || '123';
    this.stdout = new stream.PassThrough();
    this.stderr = new stream.PassThrough();
  }
  kill() {
    this.emit('close', 'a', 'b');
  }
}

module.exports = MockChildProcess;
