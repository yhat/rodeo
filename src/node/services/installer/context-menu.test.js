import installContextMenuWindowsRegistryCommands from '../../../../test/fixtures/windows-registry-commands/install-context-menu.yml';
import uninstallContextMenuWindowsRegistryCommands from '../../../../test/fixtures/windows-registry-commands/uninstall-context-menu.yml';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  processes = require('./../processes'),
  files = require('./../files');

describe(dirname + '/' + filename, function () {
  this.timeout(10000);
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(processes);
    sandbox.stub(files);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('install', function () {
    const fn = lib[this.title];

    it('installs', function () {
      const execPath = 'x/y/z';

      processes.exec.returns(bluebird.resolve());

      return fn(execPath).then(function () {
        expect(processes.exec.args).to.deep.include.members(installContextMenuWindowsRegistryCommands);
      });
    });

    it('installs with systemRoot', function () {
      const execPath = 'x/y/z',
        systemRoot = 'w';

      processes.exec.returns(bluebird.resolve());

      return fn(execPath, systemRoot).then(function () {
        const withSystemRoot = _.map(installContextMenuWindowsRegistryCommands, cmd => {
          cmd[0] = 'w/System32/reg.exe';
          return cmd;
        });

        expect(processes.exec.args).to.deep.include.members(withSystemRoot);
      });
    });
  });

  describe('uninstall', function () {
    const fn = lib[this.title];

    it('uninstalls', function () {

      processes.exec.returns(bluebird.resolve());

      return fn().then(function () {
        const args = processes.exec.args;

        expect(args).to.deep.include.members(uninstallContextMenuWindowsRegistryCommands);
      });
    });

    it('uninstalls with systemRoot', function () {
      const systemRoot = 'w';

      processes.exec.returns(bluebird.resolve());

      return fn(systemRoot).then(function () {
        const args = processes.exec.args,
          withSystemRoot = _.map(uninstallContextMenuWindowsRegistryCommands, cmd => {
            cmd[0] = 'w/System32/reg.exe';
            return cmd;
          });

        expect(args).to.deep.include.members(withSystemRoot);
      });
    });
  });
});
