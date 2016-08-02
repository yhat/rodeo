'use strict';

const bluebird = require('bluebird'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  processes = require('./processes'),
  files = require('./files'),
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

  describe('spawnPowershell', function () {
    const fn = lib[this.title];

    it('spawns', function () {
      const args = ['hi', 'there'];

      processes.exec.returns(bluebird.resolve({}));

      return fn(args).then(function () {
        expect(processes.exec.args[0][1]).to.deep.equal([
          '-noprofile',
          '-ExecutionPolicy',
          'RemoteSigned',
          '-command',
          '[Console]::OutputEncoding=[System.Text.Encoding]::UTF8\n$output=hi\n[Console]::WriteLine($output)',
          'there']);
      });
    });
  });

  describe('getPath', function () {
    const fn = lib[this.title];

    it('gets path', function () {
      processes.exec.returns(bluebird.resolve({stdout: 'a;b.c;d:e;f/g;h\\i;'}));

      return fn().then(function (result) {
        expect(result).to.deep.equal('a;b.c;d:e;f/g;h\\i;');
      });
    });
  });

  describe('installCommands', function () {
    const fn = lib[this.title];

    it('installs commands', function () {
      files.writeFile.returns(bluebird.resolve());

      return fn().then(function () {
        expect(files.writeFile.args[0].length).to.equal(2);
        expect(files.writeFile.args[1].length).to.deep.equal(2);
      });
    });
  });

  describe('addCommandsToPath', function () {
    const fn = lib[this.title];

    it('adds us to path', function () {
      const execPath = 'x/y/z';

      processes.exec
        .withArgs(sinon.match(/powershell.exe/), sinon.match.array)
        .returns(bluebird.resolve({stdout: 'a;b.c;d:e;f/g;h\\i;'}));
      processes.exec
        .withArgs('setx.exe', sinon.match.array)
        .returns(bluebird.resolve());
      files.writeFile.returns(bluebird.resolve());

      lib.setExecPath(execPath);

      return fn().then(function () {
        const args = processes.exec.withArgs(sinon.match('setx.exe', sinon.match.array)).args,
          firstCall = args[0],
          secondParameter = firstCall[1],
          secondExecArg = secondParameter[1];

        expect(secondExecArg).to.match(/a;b.c;d:e;f\/g;h\\i;.*\/x\/bin/);
      });
    });
  });

  describe('removeCommandsFromPath', function () {
    const fn = lib[this.title];

    it('adds us to path', function () {
      const execPath = 'x/y/z';

      lib.setExecPath(execPath);

      processes.exec
        .withArgs(sinon.match(/powershell.exe/), sinon.match.array)
        .returns(bluebird.resolve({stdout: 'a;b.c;d:e;f/g;h\\i;' + lib.getBinFolder()}));
      processes.exec
        .withArgs('setx.exe', sinon.match.array)
        .returns(bluebird.resolve());
      files.writeFile.returns(bluebird.resolve());

      return fn().then(function () {
        const args = processes.exec.withArgs(sinon.match('setx.exe', sinon.match.array)).args,
          firstCall = args[0],
          secondParameter = firstCall[1],
          secondExecArg = secondParameter[1];

        expect(secondExecArg).to.equal('a;b.c;d:e;f/g;h\\i');
      });
    });
  });

  describe('installContextMenu', function () {
    const fn = lib[this.title];

    it('adds us to path', function () {
      const execPath = 'x/y/z';

      lib.setExecPath(execPath);

      return fn().then(function () {
        expect(processes.exec.args).to.deep.include.members(installContextMenuWindowsRegistryCommands);
      });
    });
  });

  describe('uninstallContextMenu', function () {
    const fn = lib[this.title];

    it('adds us to path', function () {
      const execPath = 'x/y/z';

      lib.setExecPath(execPath);

      return fn().then(function () {
        const args = processes.exec.args;

        expect(args).to.deep.include.members(uninstallContextMenuWindowsRegistryCommands);
      });
    });
  });
});
