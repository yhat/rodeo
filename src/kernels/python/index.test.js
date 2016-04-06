'use strict';

const sinon = require('sinon'),
  fs = require('fs'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(fs, 'readFileSync');
    sandbox.stub(fs, 'writeFileSync');
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('testPythonPath', function () {
    const fn = lib[this.title];

    it('tests', function () {
      fn();
    });
  });
});