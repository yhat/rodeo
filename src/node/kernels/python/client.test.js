'use strict';

const AsciiToHtml = require('ansi-to-html'),
  sinon = require('sinon'),
  bluebird = require('bluebird'),
  config = require('config'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  MockChildProcess = require('../../../../test/mocks/classes/child-process'),
  processes = require('../../services/processes'),
  environment = require('../../services/env'),
  files = require('../../services/files'),
  path = require('path'),
  fs = require('fs'),
  example1 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_1.py'), {encoding: 'UTF8'}),
  example2 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_2.py'), {encoding: 'UTF8'}),
  example3 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_3.py'), {encoding: 'UTF8'}),
  example4 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_4.py'), {encoding: 'UTF8'}),
  example5 = fs.readFileSync(path.resolve('./test/mocks/jupyter_examples/example_5.py'), {encoding: 'UTF8'});

describe(dirname + '/' + filename, function () {
  this.timeout(10000);
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(environment);
    sandbox.stub(files);
    sandbox.stub(processes);
    sandbox.stub(config);
    environment.getEnv.returns(bluebird.resolve(process.env));
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('create', function () {
    const fn = lib[this.title];

    it('creates process', function () {
      const child = new MockChildProcess();

      processes.create.returns(bluebird.resolve(child));

      return fn().then(function (client) {
        return new bluebird(function (resolve) {
          // client notes when underlying process is ready for input
          client.on('ready', () => resolve());

          // the child outputs ready
          child.stdout.write('{"status": "complete", "id": "startup-complete"}\n');
        });
      });
    });
  });

  describe('check', function () {
    const fn = lib[this.title];

    it('return full path even with ~ for cmd', function () {
      files.resolveHomeDirectory.withArgs('~/b').returns('/a/b');
      processes.exec.returns({errors: [], stderr: '', stdout: ''});

      return fn({cmd: '~/b', cwd: ''}).then(function (result) {
        expect(result.cmd).to.equal('/a/b');
      });
    });

    it('return full path even with ~ for cwd', function () {
      files.resolveHomeDirectory.withArgs('~/b').returns('/a/b');
      processes.exec.returns({errors: [], stderr: '', stdout: ''});

      return fn({cmd: '', cwd: '~/b'}).then(function (result) {
        expect(result.cwd).to.equal('/a/b');
      });
    });

    it('return errors and stderr', function () {
      files.resolveHomeDirectory.returnsArg(0);
      processes.exec.returns({errors: [], stderr: '', stdout: ''});

      return fn({cmd: 'a', cwd: 'b'}).then(function (result) {
        expect(result).to.deep.equal({cmd: 'a', cwd: 'b', errors: [], stderr: '', stdout: ''});
      });
    });

    it('return data when possible', function () {
      const stdout = '{"packages": [{"a": "b"}]}';

      files.resolveHomeDirectory.returnsArg(0);
      processes.exec.returns({errors: [], stderr: '', stdout});

      return fn({cmd: 'a', cwd: 'b'}).then(function (result) {
        expect(result).to.deep.equal({
          cmd: 'a', cwd: 'b', errors: [], stderr: '', stdout, packages: [{a: 'b'}]
        });
      });
    });

    it('ignores leading characters when searching for data', function () {
      const stdout = 'dfas{"packages": [{"a": "b"}]}';

      files.resolveHomeDirectory.returnsArg(0);
      processes.exec.returns({errors: [], stderr: '', stdout});

      return fn({cmd: 'a', cwd: 'b'}).then(function (result) {
        expect(result).to.deep.equal({
          cmd: 'a', cwd: 'b', errors: [], stderr: '', stdout, packages: [{a: 'b'}]
        });
      });
    });

    it('ignores leading characters when searching for data even when it contains brackets', function () {
      const stdout = 'df{as{"packages": [{"a": "b"}]}';

      files.resolveHomeDirectory.returnsArg(0);
      processes.exec.returns({errors: [], stderr: '', stdout});

      return fn({cmd: 'a', cwd: 'b'}).then(function (result) {
        expect(result).to.deep.equal({
          cmd: 'a', cwd: 'b', errors: [], stderr: '', stdout, packages: [{a: 'b'}]
        });
      });
    });
  });

  describe('JupyterClient', function () {
    let client;

    before(function () {
      return new Promise(function (resolve) {
        return lib.create().then(function (result) {

          client = result;
          client.on('ready', function () {
            resolve();
          });
        });
      });
    });

    after(function () {
      return client.kill();
    });

    describe('getEval', function () {
      const title = this.title;
      let fn;

      before(function () {
        fn = client[title].bind(client);
      });

      it('evals', function () {
        return fn('[]').then(function (result) {
          expect(result).to.deep.equal([]);
        });
      });
    });

    describe('getStatus', function () {
      const title = this.title;
      let fn;

      before(function () {
        fn = client[title].bind(client);
      });

      it('gets current working directory when empty', function () {
        return fn([]).then(function (result) {
          expect(!!result.cwd).to.equal(true);
        });
      });

      it('gets variables when empty', function () {
        return fn([]).then(function (result) {
          expect(result.variables).to.deep.equal({function: [], Series: [], list: [], DataFrame: [], other: [], dict: [], ndarray: []});
        });
      });
    });

    describe('getAutoComplete', function () {
      const title = this.title;
      let fn;

      before(function () {
        fn = client[title].bind(client);
      });

      it('recognizes "print"', function () {
        const code = 'print "Hello"',
          cursorPos = 4;

        return fn(code, cursorPos).then(function (result) {
          expect(result).to.deep.equal({
            matches: ['print'],
            status: 'ok',
            cursor_start: 0,
            cursor_end: 4,
            metadata: {}
          });
        });
      });
    });

    describe('getInspection', function () {
      const title = this.title;
      let fn;

      before(function () {
        fn = client[title].bind(client);
      });

      it('inspects', function () {
        const convert = new AsciiToHtml(),
          code = 'obj_or_dict = {"akey": "value", "another": "value2"}',
          cursorPos = 0;

        return client.execute(code).then(function () {
          return fn(code, cursorPos);
        }).then(function (result) {
          const text = convert.toHtml(result.data['text/plain']);

          expect(result).to.have.property('status', 'ok');
          expect(result).to.have.property('found', true);
          expect(text).to.match(/Type:/);
          expect(text).to.match(/String form:/);
          expect(text).to.match(/Length:/);
          expect(text).to.match(/Docstring:/);
        });
      });
    });

    describe('isComplete', function () {
      const title = this.title;
      let fn;

      before(function () {
        fn = client[title].bind(client);
      });

      it('print "Hello" is complete with no extra information', function () {
        const code = 'print "Hello"';

        return fn(code).then(function (result) {
          expect(result).to.deep.equal({status: 'complete'});
        });
      });

      it('print "Hello is invalid with no extra information', function () {
        const code = 'print "Hello';

        return fn(code).then(function (result) {
          expect(result).to.deep.equal({status: 'invalid'});
        });
      });

      it('x = range(10 is incomplete with empty indent', function () {
        const code = 'x = range(10';

        return fn(code).then(function (result) {
          expect(result).to.deep.equal({status: 'incomplete', indent: ''});
        });
      });
    });

    describe('execute', function () {
      const title = this.title;
      let fn;

      before(function () {
        fn = client[title];
      });

      it('example 1', function () {
        const expectedResult = {status: 'ok', user_expressions: {}, payload: []};

        return fn.call(client, example1).then(function (result) {
          expect(result).to.deep.equal(expectedResult);
        });
      });

      it('example 2', function () {
        const expectedResult = {status: 'ok', user_expressions: {}, payload: []};

        return fn.call(client, example2).then(function (result) {
          expect(result).to.deep.equal(expectedResult);
        });
      });

      it('example 3', function () {
        const expectedResult = {status: 'ok', user_expressions: {}, payload: []};

        return fn.call(client, example3).then(function (result) {
          expect(result).to.deep.equal(expectedResult);
        });
      });

      it('example 4', function () {
        const expectedResult = {status: 'ok', user_expressions: {}, payload: []};

        client.on('input_request', function () {
          client.input('stuff!');
        });

        return fn.call(client, example4).then(function (result) {
          expect(result).to.deep.equal(expectedResult);
        });
      });

      it('example 5 returns NameError', function () {
        return fn.call(client, example5).then(function (result) {
          sinon.assert.match(result, {
            status: 'error', user_expressions: {},
            ename: 'NameError', evalue: 'name \'asdf\' is not defined'
          });
        });
      });
    });
  });
});
