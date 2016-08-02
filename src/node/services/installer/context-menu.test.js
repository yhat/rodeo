'use strict';

const bluebird = require('bluebird'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  processes = require('./../processes'),
  files = require('./../files'),
  jsYaml = require('js-yaml'),
  fs = require('fs'),
  installContextMenuWindowsRegistryCommands = jsYaml.safeLoad(
    fs.readFileSync('./test/fixtures/windows-registry-commands/install-context-menu.yml')
  ),
  uninstallContextMenuWindowsRegistryCommands = jsYaml.safeLoad(
    fs.readFileSync('./test/fixtures/windows-registry-commands/uninstall-context-menu.yml')
  );

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

    it('adds us to path', function () {
      const execPath = 'x/y/z';

      processes.exec.returns(bluebird.resolve());

      return fn(execPath).then(function () {
        expect(processes.exec.args).to.deep.include.members(installContextMenuWindowsRegistryCommands);
      });
    });
  });

  describe('uninstall', function () {
    const fn = lib[this.title];

    it('adds us to path', function () {

      processes.exec.returns(bluebird.resolve());

      return fn().then(function () {
        const args = processes.exec.args;

        expect(args).to.deep.include.members(uninstallContextMenuWindowsRegistryCommands);
      });
    });
  });
});
