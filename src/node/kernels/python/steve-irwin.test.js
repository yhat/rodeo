'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  client = require('./client'),
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  let sandbox,
    fakeHomedir,
    fakeCwd;

  function getMockRuleSet() {
    return [
      {
        when: _.matches({platform: 'win32'}),
        then: {cmd: 'python', shell: 'cmd.exe'}
      },
      {
        when: _.overSome(
          _.matches({platform: 'linux'}),
          _.matches({platform: 'darwin'})
        ),
        then: {cmd: 'python', shell: '/bin/bash'}
      }
    ];
  }

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(client);
    fakeHomedir = 'some fake home';
    fakeCwd = 'some fake cwd';
    lib.setRuleSet(getMockRuleSet());
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('findPythons', function () {
    const fn = lib[this.title];

    it('returns "python" on darwin does not return results without jupyter', function () {
      const platform = 'darwin',
        providedEvidence = {homedir: fakeHomedir, cwd: fakeCwd, platform},
        targetRule = {cmd: 'python', shell: '/bin/bash'},
        checkPythonResult = {},
        expectedResults = [];

      // one rule to test
      client.check.withArgs(sinon.match(targetRule)).returns(bluebird.resolve(checkPythonResult));
      // all other rules will auto-fail
      client.check.returns(bluebird.reject(new Error('some error')));

      return fn(providedEvidence).then(function (results) {
        expect(results).to.deep.equal(expectedResults);
      });
    });

    it('returns "python" on darwin with jupyter', function () {
      const platform = 'darwin',
        providedEvidence = {homedir: fakeHomedir, cwd: fakeCwd, platform},
        targetRule = {cmd: 'python', shell: '/bin/bash'},
        checkPythonResult = {hasJupyterKernel: true},
        expectedResults = [{pythonOptions: targetRule, checkResults: checkPythonResult}];

      // one rule to test
      client.check.withArgs(sinon.match(targetRule)).returns(bluebird.resolve(checkPythonResult));
      // all other rules will auto-fail
      client.check.returns(bluebird.reject(new Error('some error')));

      return fn(providedEvidence).then(function (results) {
        expect(results).to.deep.equal(expectedResults);
      });
    });
  });
});
