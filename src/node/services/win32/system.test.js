'use strict';

const bluebird = require('bluebird'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  processes = require('./../processes');

describe(dirname + '/' + filename, function () {
  this.timeout(10000);
  let sandbox;

  describe('getEnv', function () {
    const fn = lib[this.title];

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      sandbox.stub(processes);
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('does not fail on no output', function () {
      const execResult = {stdout: ''},
        expectedResult = {};

      processes.exec.returns(bluebird.resolve(execResult));

      return fn().then(function (result) {
        expect(result).to.deep.equal(expectedResult);
      });
    });

    it('returns env', function () {
      const execResult = {
          stdout: [
            'ALLUSERSPROFILE=C:\\ProgramData',
            'APPDATA=C:\\Users\\Dane\\AppData\\Roaming',
            'CommonProgramFiles=C:\\Program Files\\Common Files',
            'CommonProgramFiles(x86)=C:\\Program Files (x86)\\Common Files',
            'CommonProgramW6432=C:\\Program Files\\Common Files',
            'COMPUTERNAME=DESKTOP-543MDEB',
            'Test=Test=Test'
          ].join('\n')
        },
        expectedResult = {
          ALLUSERSPROFILE: 'C:\\ProgramData',
          APPDATA: 'C:\\Users\\Dane\\AppData\\Roaming',
          CommonProgramFiles: 'C:\\Program Files\\Common Files',
          'CommonProgramFiles(x86)': 'C:\\Program Files (x86)\\Common Files',
          CommonProgramW6432: 'C:\\Program Files\\Common Files',
          COMPUTERNAME: 'DESKTOP-543MDEB',
          Test: 'Test'
        };

      processes.exec.returns(bluebird.resolve(execResult));

      return fn().then(function (result) {
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});
