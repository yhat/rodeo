'use strict';

const _ = require('lodash'),
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    lib.resetOutputMap();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('handle', function () {
    const fn = lib[this.title];

    it('reports unknown objects', function () {
      const emitSpy = sinon.spy(),
        requestMap = {},
        client = {emit: emitSpy, requestMap},
        response = {};

      fn(client, response);

      sinon.assert.calledWith(emitSpy, 'error', new Error('Error: Unknown data object: {}'));
    });

    it('reports ready', function () {
      const emitSpy = sinon.spy(),
        requestMap = {},
        client = {emit: emitSpy, requestMap},
        response = {status: 'complete', id: 'startup-complete'};

      fn(client, response);

      sinon.assert.calledWith(emitSpy, 'ready');
    });

    it('links request to expected output', function () {
      const requestMap = {abc: {}},
        client = {emit: _.noop, requestMap},
        response = {source: 'link', id: 'abc', result: 'def'},
        expectedRequestMap = {abc: {msg_id: 'def'}},
        expectedOutputMap = {def: {id: 'abc', msg_id: 'def'}};

      fn(client, response);

      expect(requestMap).to.deep.equal(expectedRequestMap);
      expect(lib.getOutputMap()).to.deep.equal(expectedOutputMap);
    });

    it('reports response from source', function () {
      const emitSpy = sinon.spy(),
        requestMap = {},
        client = {emit: emitSpy, requestMap},
        response = {source: 'some source', result: {a: 'b'}};

      fn(client, response);

      sinon.assert.calledWith(emitSpy, 'some source', response);
    });

    it('reports output from request with broadcast (not silent)', function () {
      const emitSpy = sinon.spy(),
        resolveSpy = sinon.spy(),
        deferred = {resolve: resolveSpy},
        resolveEvent = 'yay!',
        requestMap = {abc: {deferred, resolveEvent}},
        client = {emit: emitSpy, requestMap},
        source = 'some source',
        content = {someValue: 'something really important'},
        response = {source, result: {msg_type: resolveEvent, content, parent_header: {msg_id: 'def'}}};

      fn(client, {source: 'link', id: 'abc', result: 'def'}); // request link
      fn(client, response);

      sinon.assert.calledWith(resolveSpy, content);
      sinon.assert.calledOnce(emitSpy);
      expect(lib.getOutputMap()).to.deep.equal({}); // empty because the request has been handle #no-memory-leaks
    });

    it('reports output from request without broadcast (silent)', function () {
      const emitSpy = sinon.spy(),
        resolveSpy = sinon.spy(),
        deferred = {resolve: resolveSpy},
        resolveEvent = 'yay!',
        requestMap = {abc: {deferred, resolveEvent, hidden: true}},
        client = {emit: emitSpy, requestMap},
        source = 'some source',
        content = {someValue: 'something really important'},
        response = {source, result: {msg_type: resolveEvent, content, parent_header: {msg_id: 'def'}}};

      fn(client, {source: 'link', id: 'abc', result: 'def'}); // request link
      fn(client, response);

      sinon.assert.calledWith(resolveSpy, content);
      sinon.assert.notCalled(emitSpy);
      expect(lib.getOutputMap()).to.deep.equal({}); // empty because the request has been handle #no-memory-leaks
    });

    it('reports output from request that is not a resolution', function () {
      const emitSpy = sinon.spy(),
        resolveSpy = sinon.spy(),
        deferred = {resolve: resolveSpy},
        resolveEvent = 'yay!',
        nonResolveEvent = 'aww!',
        requestMap = {abc: {deferred, resolveEvent}},
        client = {emit: emitSpy, requestMap},
        source = 'some source',
        content = {someValue: 'something really important'},
        response = {source, result: {msg_type: nonResolveEvent, content, parent_header: {msg_id: 'def'}}};

      fn(client, {source: 'link', id: 'abc', result: 'def'}); // request link
      fn(client, response);

      sinon.assert.notCalled(resolveSpy, content);
      sinon.assert.calledOnce(emitSpy);
      expect(lib.getOutputMap()).to.deep.equal({
        def: {
          header: {
            msg_id: 'def'
          },
          id: 'abc',
          msg_id: 'def'
        }
      }); // not empty, something hasn't resolved
    });

    it('reports eval source results', function () {
      const emitSpy = sinon.spy(),
        resolveSpy = sinon.spy(),
        deferred = {resolve: resolveSpy},
        requestMap = {abc: {deferred}},
        client = {emit: emitSpy, requestMap},
        source = 'eval',
        result = 'something really important',
        response = {source, result: result, id: 'abc'};

      fn(client, response);

      sinon.assert.calledWith(resolveSpy, result);
      sinon.assert.notCalled(emitSpy);
      expect(lib.getOutputMap()).to.deep.equal({}); // empty because the request has been handle #no-memory-leaks
    });
  });
});
