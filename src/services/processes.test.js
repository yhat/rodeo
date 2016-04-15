'use strict';

const expect = require('chai').expect,
  sinon = require('sinon'),
  childProcess = require('child_process'),
  EventEmitter = require('events'),
  log = require('./log'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(log);
    sandbox.stub(childProcess);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('create', function () {
    const fn = lib[this.title];

    it('creates', function () {
      const cmd = 'some command',
        eventOn = sinon.stub(),
        mockChild = {pid: '123', on: eventOn};

      eventOn.returns(mockChild);
      childProcess.spawn.returns(mockChild);

      expect(fn(cmd)).to.equal(mockChild);
    });
  });

  describe('kill', function () {
    const fn = lib[this.title];

    it('kills', function () {
      const mockChild = new EventEmitter();

      mockChild.kill = function () {
        mockChild.emit('close', 'a', 'b');
      };

      return fn(mockChild).then(function (result) {
        expect(result).to.deep.equal({code: 'a', signal: 'b'});
      });
    });
  });
});