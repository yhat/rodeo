'use strict';

const bluebird = require('bluebird'),
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  log = require('../../services/log').asInternal(__filename);

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('create', function () {
    const fn = lib[this.title];

    it('creates', function () {
      this.timeout(10000);
      const kernel = fn();

      return bluebird.delay(100).then(function () {
        return kernel.kill();
      });
    });
  });
});