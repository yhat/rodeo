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

  describe('onCloseWindow', function () {
    const fn = lib[this.title];

    it('closes window', function () {
      const spy = sinon.spy(),
        window = { webContents: { send: spy }},
        event = {};

      fn.bind(window, event)();

      sinon.assert.calledWith(spy, 'kill');
    });
  });
});