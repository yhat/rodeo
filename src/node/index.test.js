'use strict';

const bluebird = require('bluebird'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  fs = require('fs'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  log = require('./services/log'),
  browserWindows = require('./services/browser-windows'),
  files = require('./services/files');

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(fs, 'readFileSync');
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(log, 'log');
    sandbox.stub(browserWindows);
    sandbox.stub(files);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('onCloseWindow', function () {
    const fn = lib[this.title];

    it('closes window', function () {
      const spy = sinon.spy(),
        data = 'some window name',
        fakeWindow = {close: spy};

      browserWindows.getByName.returns(fakeWindow);

      return fn(data).then(function () {
        sinon.assert.calledOnce(spy);
      });
    });
  });

  describe('onFiles', function () {
    const fn = lib[this.title];

    it('throws on undefined parameter', function () {
      expect(function () {
        fn();
      }).to.throw('onFiles expects a string as the first argument');
    });

    it('throws on object-type parameter', function () {
      expect(function () {
        fn({});
      }).to.throw('onFiles expects a string as the first argument');
    });

    it('returns files', function () {
      const dirPath = 'test',
        expectedResult = [{}];

      files.readDirectory.returns(bluebird.resolve(expectedResult));

      return fn(dirPath).then(function (result) {
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});