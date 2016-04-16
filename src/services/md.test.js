'use strict';

const expect = require('chai').expect,
  sinon = require('sinon'),
  log = require('./log'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  pythonKernel = require('../kernels/python');

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(log);

    lib.setRepeatedLanguages(['langA', 'langB']);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('splitUpCells', function () {
    const fn = lib[this.title];

    it('handles plain markdown', function () {
      const text = 'random text';

      expect(fn(text)).to.deep.equal([{ execute: 'markdown', data: 'random text' }]);
    });

    it('handles ```<empty>', function () {
      const text = '```\nrandom text\n```';

      expect(fn(text)).to.deep.equal([
        { execute: 'markdown', data: '' },
        { execute: 'code', data: 'random text' },
        { execute: 'markdown', data: '' }
      ]);
    });

    it('handles ```{langB} (repeated language)', function () {
      const text = '```{langB}\nrandom text\n```';

      expect(fn(text)).to.deep.equal([
        { execute: 'markdown', data: '\n```langB\nrandom text\n```' },
        { execute: 'langB', data: 'random text' },
        { execute: 'markdown', data: '' }
      ]);
    });

    it('handles ```{langC} (non-repeated language)', function () {
      const text = '```{langC}\nrandom text\n```';

      expect(fn(text)).to.deep.equal([
        { execute: 'markdown', data: '' },
        { execute: 'langC', data: 'random text' },
        { execute: 'markdown', data: '' }
      ]);
    });
  });

  describe('knitHTML', function () {
    const fn = lib[this.title];
    let pythonWrapper;

    beforeEach(function () {
      return new Promise(function (resolve, reject) {
        pythonKernel.startNewKernel('/usr/local/bin/python', function (status, python) {
          if (status.jupyter !== true || status.python !== true) {
            reject(new Error('unable to start python with jupyter'));
          } else {
            pythonWrapper = python;
            resolve();
          }
        });
      });
    });

    it('handles markdown', function (done) {
      const text = 'random text',
        expectedResult = '<p>random text</p>\n';

      fn(text, pythonWrapper, function (err, result) {
        expect(err).to.equal(null);
        expect(result).to.equal(expectedResult);
        done(err);
      });
    });

    it('handles python', function (done) {
      const text = '```{python}\nprint "Hello."\n```',
        expectedResult = '<pre>Hello.\n</pre>\n<pre>Hello.\n</pre>';

      fn(text, pythonWrapper, function (err, result) {
        if (err) {
          done(err);
        } else {
          expect(result).to.equal(expectedResult);
          done();
        }
      });
    });
  });
});