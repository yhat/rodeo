'use strict';

const expect = require('chai').expect,
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  client = require('../kernels/python/client');

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
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
    let python;

    before(function () {
      return client.create().then(function (client) {
        python = client;
      });
    });

    after(function () {
      if (python) {
        return python.kill();
      }
    });

    it('handles markdown', function () {
      const text = 'random text',
        expectedResult = '<p>random text</p>\n';

      return fn(text, python).then(function (result) {
        expect(result).to.equal(expectedResult);
      });
    });

    it('handles python as repeated language', function () {
      const text = '```{python}\nprint "Hello."\n```',
        expectedResult =
          '<pre><code class="lang-python"><span class="hljs-built_in">print</span> ' +
          '<span class="hljs-string">"Hello."</span>\n</code></pre>\n\n<pre>Hello.\n</pre>\n';

      lib.setRepeatedLanguages(['python']);

      return fn(text, python).then(function (result) {
        expect(result).to.equal(expectedResult);
      });
    });

    it('handles mathjax (by leaving it unchanged)', function () {
      const text = '```{mathjax}\n... we have `\(x_1 = 132\)` and `\(x_2 = 370\)` and so ...\n```',
        expectedResult = '\n... we have `(x_1 = 132)` and `(x_2 = 370)` and so ...\n';

      return fn(text, python).then(function (result) {
        expect(result).to.equal(expectedResult);
      });
    });
  });
  
  describe('applyReportTemplate', function () {
    const fn = lib[this.title];

    it('applies template without throwing error', function () {
      const html = 'some html';

      // doesn't throw error
      return fn(html);
    });
  });
});