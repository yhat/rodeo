'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  client = require('./client'),
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  log = require('../../services/log').asInternal(__filename);

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

    it('returns "python" on darwin', function () {
      const platform = 'darwin';

      client.checkPython.withArgs(sinon.match({cmd: 'python', shell: '/bin/bash'}))
        .returns(bluebird.resolve({}));
      client.checkPython.returns(bluebird.reject(new Error('some error')));

      return fn({homedir: fakeHomedir, cwd: fakeCwd, platform}).then(function (results) {
        expect(results).to.deep.equal([{pythonOptions: {cmd: 'python', shell: '/bin/bash'}, checkResults: {}}]);
      });
    });

    it('returns "python" on linux', function () {
      const platform = 'linux';

      client.checkPython.withArgs(sinon.match({cmd: 'python', shell: '/bin/bash'}))
        .returns(bluebird.resolve({}));
      client.checkPython.returns(bluebird.reject(new Error('some error')));

      return fn({homedir: fakeHomedir, cwd: fakeCwd, platform}).then(function (results) {
        log('info', results);
        expect(results).to.deep.equal([{pythonOptions: {cmd: 'python', shell: '/bin/bash'}, checkResults: {}}]);
      });
    });

    it('returns "python" on windows', function () {
      const platform = 'win32';

      client.checkPython.withArgs(sinon.match({cmd: 'python', shell: 'cmd.exe'}))
        .returns(bluebird.resolve({}));
      client.checkPython.returns(bluebird.reject(new Error('some error')));

      return fn({homedir: fakeHomedir, cwd: fakeCwd, platform}).then(function (results) {
        expect(results).to.deep.equal([{pythonOptions: {cmd: 'python', shell: 'cmd.exe'}, checkResults: {}}]);
      });
    });
  });
});
