'use strict';

const expect = require('chai').expect,
  sinon = require('sinon'),
  fs = require('fs'),
  files = require('./files'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(files);
    sandbox.stub(fs, 'writeFileSync');
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getPreferences', function () {
    const fn = lib[this.title];

    it('returns object with id', function () {
      files.getJSONFileSafeSync.returns({});

      expect(fn()).to.have.property('id').that.is.a('string');
    });
  });
});