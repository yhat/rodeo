'use strict';

const expect = require('chai').expect,
  sinon = require('sinon'),
  log = require('./log'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

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

    it('adds a newline to the end of any random text', function () {
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
});