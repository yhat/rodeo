'use strict';

const _ = require('lodash'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  fs = require('fs'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  log = require('./log');

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(fs, 'readFileSync');
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(fs, 'readFile');
    sandbox.stub(fs, 'readdir');
    sandbox.stub(fs, 'lstat');
    sandbox.stub(log);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getInternalJSONFileSafeSync', function () {
    const fn = lib[this.title];

    it('returns null if file does not exist', function () {
      const filePath = 'some path';

      fs.readFileSync.throws('some error');

      expect(fn(filePath)).to.equal(null);
    });

    it('returns null and warns if json is invalid', function () {
      const filePath = 'some path';

      fs.readFileSync.returns('{"a":{"b":"c}');

      expect(fn(filePath)).to.equal(null);
      sinon.assert.calledWith(log.log, 'warn', sinon.match(/is not valid JSON/));
    });

    it('returns object if json is valid', function () {
      const filePath = 'some path',
        data = {a: {b: 'c'}};

      fs.readFileSync.returns(JSON.stringify(data));

      expect(fn(filePath)).to.deep.equal(data);
    });
  });

  describe('readDirectory', function () {
    const fn = lib[this.title];

    it('reads directory', function () {
      const filename = 'some directory',
        expectedList = ['some', 'result'],
        expectedResult = [
          {
            base: 'some',
            dir: 'some directory',
            name: 'some',
            ext: '',
            path: 'some directory/some',
            isDirectory: true,
            isFile: false,
            isSymbolicLink: false,
            root: ''
          },
          {
            base: 'result',
            dir: 'some directory',
            name: 'result',
            ext: '',
            path: 'some directory/result',
            isDirectory: false,
            isFile: false,
            isSymbolicLink: false,
            root: ''
          }
        ];

      fs.readdir.yields(null, expectedList);
      fs.lstat.onCall(0).yields(null, {isDirectory: _.constant(true)});
      fs.lstat.onCall(1).yields(null, {isDirectory: _.constant(false)});

      return fn(filename).reflect().then(function (result) {
        expect(result.value()).to.deep.equal(expectedResult);
      });
    });

    it('throws when error', function () {
      const filename = 'some directory',
        someError = new Error('some error');

      fs.readdir.yields(someError);

      return fn(filename).reflect().then(function (result) {
        expect(result.reason()).to.deep.equal(someError);
      });
    });
  });

  describe('saveToTemporaryFile', function () {
    const fn = lib[this.title];

    it('saves with extension', function () {
      const extension = '.html',
        data = 'abc';

      return fn(extension, data).then(function (filePath) {
        expect(filePath).to.match(/\.html$/);
      });
    });
  });
});
