'use strict';

const expect = require('chai').expect,
  sinon = require('sinon'),
  fs = require('fs'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '::' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(fs, 'readFileSync');
    sandbox.stub(fs, 'writeFileSync');
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getJSONFileSafeSync', function () {
    const fn = lib[this.title];

    it('returns null if file does not exist', function () {
      const filePath = '';

      fs.readFileSync.throws('some error');

      expect(fn(filePath)).to.equal(null);
    });

    it('returns null if json is invalid', function () {
      const filePath = '';

      fs.readFileSync.returns('{"a":{"b":"c}');

      expect(fn(filePath)).to.equal(null);
    });

    it('returns object if json is valid', function () {
      const filePath = '',
        data = {a: {b: 'c'}};

      fs.readFileSync.returns(JSON.stringify(data));

      expect(fn(filePath)).to.deep.equal(data);
    });
  });
});