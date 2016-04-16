'use strict';

const _ = require('lodash'),
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  log = require('../../services/log').asInternal(__filename),
  processes = require('../../services/processes'),
  fs = require('fs'),
  path = require('path'),
  example1 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_1.py'), {encoding: 'UTF8'}),
  example2 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_2.py'), {encoding: 'UTF8'}),
  example3 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_3.py'), {encoding: 'UTF8'}),
  example4 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_4.py'), {encoding: 'UTF8'});

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('create', function () {
    const fn = lib[this.title];

    it('creates', function () {
      this.timeout(10000);
      return fn().then(function (client) {
        expect(processes.getChildren().length).to.equal(1);
        return client.kill();
      }).then(function () {
        expect(processes.getChildren().length).to.equal(0);
      });
    });
  });

  describe('JupyterClient', function () {
    let client;

    beforeEach(function () {
      this.timeout(10000);
      return lib.create().then(function (newClient) {
        client = newClient;
      });
    });

    afterEach(function () {
      if (client) {
        client.kill();
      }
    });

    describe('execute', function () {
      const title = this.title;
      let fn;

      beforeEach(function () {
        fn = client[title];
      });

      it('example 1', function () {
        this.timeout(10000);
        const expectedResult = {status: 'ok', user_expressions: {}, execution_count: 2};

        return fn.call(client, example1).then(function (result) {
          expect(result).to.deep.equal(expectedResult);
        });
      });

      it('example 2', function () {
        this.timeout(10000);
        const expectedResult = {status: 'ok', user_expressions: {}, execution_count: 2};

        return fn.call(client, example2).then(function (result) {
          expect(result).to.deep.equal(expectedResult);
        });
      });

      it('example 3', function () {
        this.timeout(10000);
        const expectedResult = {status: 'ok', user_expressions: {}, execution_count: 2};

        return fn.call(client, example3).then(function (result) {
          expect(result).to.deep.equal(expectedResult);
        });
      });

      it('example 4', function () {
        this.timeout(10000);
        const expectedResult = {status: 'ok', user_expressions: {}, execution_count: 2};

        client.on('input_request', function (data) {
          client.input('stuff!');
        });

        return fn.call(client, example4).then(function (result) {
          expect(result).to.deep.equal(expectedResult);
        });
      });
    });

    describe('getResult', function () {
      const title = this.title;
      let fn;

      beforeEach(function () {
        fn = client[title];
      });

      it('example 1', function () {
        this.timeout(10000);

        return fn.call(client, example1).then(function (result) {
          expect(result).to.have.property('data').that.is.an('object')
            .with.property('image/png').that.is.an('string');
          expect(result).to.have.deep.property('metadata').that.is.an('object')
            .that.deep.equals({});
        });
      });

      it('example 2', function () {
        this.timeout(10000);

        return fn.call(client, example2).then(function (result) {
          expect(result).to.have.property('data').that.is.an('object')
            .with.property('text/html').that.is.an('string');
          expect(result).to.have.deep.property('metadata').that.is.an('object')
            .that.deep.equals({});
        });
      });

      it('example 3', function () {
        this.timeout(10000);

        return fn.call(client, example3).then(function (result) {
          expect(result).to.have.property('data').that.is.an('object')
            .with.property('text/plain').that.is.an('string');
          expect(result).to.have.property('data').that.is.an('object')
            .with.property('text/html').that.is.an('string');
          expect(result).to.have.deep.property('metadata').that.is.an('object')
            .that.deep.equals({});
        });
      });

      it('example 4', function () {
        this.timeout(10000);

        client.on('input_request', function (data) {
          client.input('stuff!');
        });

        return fn.call(client, example4).then(function (result) {
          expect(result).to.deep.equal({ text: 'stuff!\n', name: 'stdout' });
        });
      });
    });
  });
});