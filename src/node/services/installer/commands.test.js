const bluebird = require('bluebird'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  processes = require('./../processes'),
  files = require('./../files'),
  path = require('path');

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

  describe('addToPath', function () {
    const fn = lib[this.title];

    it('adds us to path', function () {
      const appCommandName = 'a',
        execPath = 'x/y/z';

      processes.exec
        .withArgs(sinon.match(/powershell.exe/), sinon.match.array)
        .returns(bluebird.resolve({stdout: 'a;b.c;d:e;f/g;h\\i;'}));
      processes.exec
        .withArgs('setx.exe', sinon.match.array)
        .returns(bluebird.resolve());
      files.exists.returns(bluebird.resolve(true));
      files.writeFile.returns(bluebird.resolve());

      return fn(appCommandName, execPath).then(function () {
        const args = processes.exec.withArgs(sinon.match('setx.exe', sinon.match.array)).args,
          firstCall = args[0],
          secondParameter = firstCall[1],
          secondExecArg = secondParameter[1];

        expect(secondExecArg).to.match(/a;b.c;d:e;f\/g;h\\i;.*\/x\/y\/bin/);
      });
    });

    it('adds us to path with systemRoot', function () {
      const appCommandName = 'a',
        execPath = 'x/y/z',
        systemRoot = 'w';

      processes.exec
        .withArgs(sinon.match(/powershell.exe/), sinon.match.array)
        .returns(bluebird.resolve({stdout: 'a;b.c;d:e;f/g;h\\i;'}));
      processes.exec
        .withArgs('setx.exe', sinon.match.array)
        .returns(bluebird.resolve());
      files.exists.returns(bluebird.resolve(true));
      files.writeFile.returns(bluebird.resolve());

      return fn(appCommandName, execPath, systemRoot).then(function () {
        const args = processes.exec.withArgs(sinon.match(/w.?System32.?setx.exe/, sinon.match.array)).args,
          firstCall = args[0],
          secondParameter = firstCall[1],
          secondExecArg = secondParameter[1];

        expect(secondExecArg).to.match(/a;b.c;d:e;f\/g;h\\i;.*\/x\/y\/bin/);
      });
    });
  });

  describe('removeFromPath', function () {
    const fn = lib[this.title];

    it('removes us to path', function () {
      const execPath = 'x/y/z',
        binFolder = path.resolve(execPath, '..', 'bin');

      processes.exec
        .withArgs(sinon.match(/powershell.exe/), sinon.match.array)
        .returns(bluebird.resolve({stdout: 'a;b.c;d:e;f/g;h\\i;' + binFolder}));
      processes.exec
        .withArgs('setx.exe', sinon.match.array)
        .returns(bluebird.resolve());
      files.exists.returns(bluebird.resolve(true));
      files.writeFile.returns(bluebird.resolve());

      return fn(execPath).then(function () {
        const args = processes.exec.withArgs(sinon.match('setx.exe', sinon.match.array)).args,
          firstCall = args[0],
          secondParameter = firstCall[1],
          secondExecArg = secondParameter[1];

        expect(secondExecArg).to.equal('a;b.c;d:e;f/g;h\\i');
      });
    });

    it('removes us to path with systemRoot', function () {
      const execPath = 'x/y/z',
        binFolder = path.resolve(execPath, '..', 'bin'),
        systemRoot = 'w';

      processes.exec
        .withArgs(sinon.match(/powershell.exe/), sinon.match.array)
        .returns(bluebird.resolve({stdout: 'a;b.c;d:e;f/g;h\\i;' + binFolder}));
      processes.exec
        .withArgs('setx.exe', sinon.match.array)
        .returns(bluebird.resolve());
      files.exists.returns(bluebird.resolve(true));
      files.writeFile.returns(bluebird.resolve());

      return fn(execPath, systemRoot).then(function () {
        const args = processes.exec.withArgs(sinon.match(/w.?System32.?setx.exe/, sinon.match.array)).args,
          firstCall = args[0],
          secondParameter = firstCall[1],
          secondExecArg = secondParameter[1];

        expect(secondExecArg).to.equal('a;b.c;d:e;f/g;h\\i');
      });
    });
  });
});
