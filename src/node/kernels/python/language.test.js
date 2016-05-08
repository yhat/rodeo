'use strict';

const sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('toPythonArgs', function () {
    const fn = lib[this.title];

    it('converts', function () {
      const data = {a: 'b', cD: 'e', fgHi: 'j'},
        expectedResult = {a: 'b', c_d: 'e', fg_hi: 'j'};

      expect(fn(data)).to.deep.equal(expectedResult);
    });
  });

  describe('setDefaultEnvVars', function () {
    const fn = lib[this.title];

    it('removes buffering', function () {
      const data = {};

      expect(fn(data)).to.have.property('PYTHONUNBUFFERED');
    });
  });
});
