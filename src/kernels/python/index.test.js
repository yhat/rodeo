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

  describe('startNewKernel', function () {
    const fn = lib[this.title];

    xit('tests', function (done) {
      fn('/usr/local/bin/python', function (err, python) {
        expect(err).to.deep.equal({ python: true, jupyter: true });

        try {
          python.kill();
          done();
        } catch (ex) {
          done(ex);
        }
      });
    });
  });

  describe('testPythonPath', function () {
    const fn = lib[this.title];

    xit('tests', function (done) {
      fn('/usr/local/bin/python', function () {
        done();
      });
    });
  });
});