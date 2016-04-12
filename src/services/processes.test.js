'use strict';

const expect = require('chai').expect,
  sinon = require('sinon'),
  childProcess = require('child_process'),
  log = require('./log'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(log);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getShellTaskOutput', function () {
    const fn = lib[this.title];

    it('returns', function () {
      return fn('echo test').then(function (result) {
        expect(result).to.deep.equal('test\n');
      });
    });
  });
});