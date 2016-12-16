const bluebird = require('bluebird'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  processes = require('../processes'),
  files = require('../files'),
  path = require('path');

describe(dirname + '/' + filename, function () {
  this.timeout(10000);
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(processes);
    sandbox.stub(files);
    sandbox.stub(path, 'resolve', path.join);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('create', function () {
    const fn = lib[this.title];

    it('creates', function () {
      const execPath = 'w/x/y.z';

      processes.exec.returns(bluebird.resolve());

      return fn(execPath).then(function () {
        expect(processes.exec.firstCall.args).to.deep.equal(['w/Update.exe', [ '--createShortcut', 'y.z' ]]);
      });
    });
  });

  describe('remove', function () {
    const fn = lib[this.title];

    it('removes', function () {
      const execPath = 'w/x/y.z';

      processes.exec.returns(bluebird.resolve());

      return fn(execPath).then(function () {
        expect(processes.exec.firstCall.args).to.deep.equal(['w/Update.exe', [ '--removeShortcut', 'y.z' ]]);
      });
    });
  });

  describe('update', function () {
    const fn = lib[this.title];

    it('No home directory provided (?!), so create shortcuts', function () {
      const execPath = 'w/x/y.z',
        appName = 'c';

      processes.exec.returns(bluebird.resolve());
      files.exists.returns(bluebird.resolve(false));
      files.unlink.returns(bluebird.resolve());

      return fn(execPath, appName).then(function () {
        expect(processes.exec.firstCall.args).to.deep.equal(['w/Update.exe', [ '--createShortcut', 'y.z' ]]);
      });
    });

    it('shortcuts do not exist, so create them', function () {
      const execPath = 'w/x/y.z',
        appName = 'c',
        homeDirectory = 'd';

      processes.exec.returns(bluebird.resolve());
      files.exists.returns(bluebird.resolve(false));
      files.unlink.returns(bluebird.resolve());

      return fn(execPath, appName, homeDirectory).then(function () {
        expect(processes.exec.firstCall.args).to.deep.equal(['w/Update.exe', [ '--createShortcut', 'y.z' ]]);
      });
    });

    it('shortcuts already existed but they deleted them, so update but unlink them?', function () {
      const execPath = 'w/x/y.z',
        appName = 'c',
        homeDirectory = 'd';

      processes.exec.returns(bluebird.resolve());
      files.exists.returns(bluebird.resolve(true));

      return fn(execPath, appName, homeDirectory).then(function () {
        expect(processes.exec.firstCall.args).to.deep.equal(['w/Update.exe', [ '--createShortcut', 'y.z' ]]);
        expect(files.unlink.args).to.deep.equal([]);
      });
    });
  });
});
