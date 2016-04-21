'use strict';

const bluebird = require('bluebird'),
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  kernel = require('./kernel'),
  processes = require('../../services/processes');

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
      const client = fn();

      return bluebird.delay(1000).then(function () {
        expect(processes.getChildren().length).to.equal(1);
        return client.kill();
      }).then(function () {
        expect(processes.getChildren().length).to.equal(0);
      });
    });

    it('creates with kernel', function () {
      this.timeout(10000);
      const kernelProcess = kernel.create(),
        clientConsole = fn();

      clientConsole.childProcess.stdin.write('print "Hello"');
      expect(processes.getChildren().length).to.equal(2);

      return bluebird.all([clientConsole.kill(), kernelProcess.kill()]).then(function (exitCodes) {
        expect(exitCodes).to.deep.equal([
          {code: null, signal: 'SIGTERM'},
          {code: null, signal: 'SIGTERM'}
        ]);
        expect(processes.getChildren().length).to.equal(0);
      });
    });
  });
});