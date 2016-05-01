'use strict';

const _ = require('lodash'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  childProcess = require('child_process'),
  MockChildProcess = require('../../test/mocks/classes/child-process'),
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
        mockChild = new MockChildProcess();

      childProcess.spawn.returns(mockChild);

      expect(fn(cmd)).to.equal(mockChild);
    });
  });

  describe('kill', function () {
    const fn = lib[this.title];

    it('kills', function () {
      const mockChild = new MockChildProcess();

      return fn(mockChild).then(function (result) {
        expect(result).to.deep.equal({code: 'a', signal: 'b'});
      });
    });
  });
});