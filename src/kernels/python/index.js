'use strict';

const fs = require('fs'),
  fse = require('fs-extra'),
  path = require('path'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  uuid = require('uuid'),
  tmp = require('tmp'),
  os = require('os'),
  StreamSplitter = require('stream-splitter'),
  log = require('./../../services/log').asInternal(__filename),
  kernelLog = require('./../../services/log').asInternal('python-kernel'),
  SteveIrwin = require('./steve-irwin'),
  errNotReady = {
    stream: null,
    image: null,
    error: 'Python is still starting up. Please wait a moment...',
    output: ''
  };

global.completionCallbacks = {};

function spawnPython(cmd, opts, done) {

  log('info', 'starting python using', cmd, opts);

  const kernelDir = path.join(__dirname),
    tmpKernelDir = tmp.dirSync(),
    kernelFile = path.join(tmpKernelDir.name, 'asynckernel.py'),
    configFile = path.join(tmpKernelDir.name, 'config.json'),
    delim = '\n';
  let python;

  // we need to actually write the python kernel to a tmp file. this is so python
  // can run as a "real" file and not an asar file

  log('info', 'copying file', kernelDir, 'to', tmpKernelDir.name);
  fse.copySync(kernelDir, tmpKernelDir.name);

  python = spawn(cmd, [kernelFile, configFile, delim], opts);

  // we'll print any feedback from the kernel as yellow text
  python.stderr.on('data', function (data) {
    kernelLog('error', data);
  });

  python.on('error', function (err) {
    kernelLog('error', err);
  });

  python.on('exit', function (code) {
    fs.unlink(kernelFile, function (err) {
      if (err) {
        kernelLog('error', 'failed to remove temporary kernel file', err);
      }
    });
    kernelLog('info', 'exited with code', code);
  });

  python.on('close', function (code) {
    kernelLog('info',  'closed with code', code);
  });

  python.on('disconnect', function () {
    kernelLog('info', 'disconnected');
  });

  // StreamSplitter looks at the incoming stream from asynckernel.py (which is line
  // delimited JSON) and splits on \n automatically, so we're just left with the
  // JSON data
  python.stdout.pipe(StreamSplitter(delim))
    .on('token', function (data) {
      const result = JSON.parse(data.toString());

      if (result.id in completionCallbacks) {
        completionCallbacks[result.id](result);
        if (result.status === 'complete') {
          // we're going to hang onto the "startup-complete" callback to handle
          // the case when the user restarts there python session. this is very
          // important!
          if (result.id != 'startup-complete') {
            delete completionCallbacks[result.id];
          }
        }
      } else {
        log('error', 'callback not found', result.id, '-->', result);
      }
    });

  python.execute = function (cmd, complete, fn) {
    if (this.stdin.writable === false) {
      if (fn) {
        fn(errNotReady);
      }
      return;
    }

    const payload = { async: false, id: uuid.v4().toString(), code: cmd, complete: complete };
    let output = '';

    completionCallbacks[payload.id] = function (result) {
      // autocompleted results come back as a proper JSON array
      if (complete === true) {
        output = result.output;
      } else {
        output = output + (result.output || '');
      }
      if (result.status == 'complete') {
        if (fn) {
          fn(result);
        }
      }
    };

    this.stdin.write(JSON.stringify(payload) + delim);
  };

  python.executeStream = function (cmd, complete, fn) {
    if (this.stdin.writable === false) {
      fn(errNotReady);
      return;
    }

    const payload = { async: true, id: uuid.v4().toString(), code: cmd, complete: complete };

    completionCallbacks[payload.id] = fn;

    this.stdin.write(JSON.stringify(payload) + delim);
  };

  const profileFilePath = path.join(os.homedir(), '.rodeoprofile');

  if (! fs.existsSync(profileFilePath)) {
    const defaultProfilePath = path.join(__dirname, 'default-rodeo-profile.txt'),
      defaultProfile = fs.readFileSync(defaultProfilePath, {encoding: 'UTF8'});

    fs.writeFileSync(profileFilePath, defaultProfile);
  }

  let rodeoProfile;
  try {
    rodeoProfile = fs.readFileSync(profileFilePath, {encoding: 'UTF8'});
  } catch (ex) {
    log('error', ex);
  }

  // wait for the python child to emit a message. once it does (it'll be
  // something simple like {"status": "OK"}, then we know it's running
  // and we can start Rodeo
  // TODO: this does not work on windows
  let hasStarted = false;

  completionCallbacks['startup-complete'] = function (data) {
    log('info', 'kernel is running');

    if (rodeoProfile) {
      python.execute(rodeoProfile, false, function () {
        hasStarted = true;
        done(null, python);
      });
    } else {
      hasStarted = true;
      done(null, python);
    }
  };

  // TODO: this is happening every time on Windows. fuck you windows
  setTimeout(function () {
    if (hasStarted == false) {
      done('Could not start Python kernel', null);
    }
  }, 7500);
}

module.exports.startNewKernel = function (pythonCmd, cb) {
  if (! pythonCmd) {
    SteveIrwin.findMeAPython(function (err, pythonCmd, opts) {

      if (err.python === false || err.jupyter === false) {
        cb(err, { spawnfile: pythonCmd });
      } else {
        spawnPython(pythonCmd, opts, function (err, python) {
          if (err) {
            log('error', err);
          }

          cb({ python: true, jupyter: true }, python);
        });
      }
    });
  } else {
    testPythonPath(pythonCmd, function (err, result) {
      if (! result) {
        result = { jupyter: false, python: false };
      }

      let data = {
        python: err === null,
        jupyter: result.jupyter === true
      };

      if (err) {
        log('error', 'could not start subprocess', err);
        cb(data, null);
      } else if (result.jupyter === false) {
        cb(data, null);
      } else {
        spawnPython(pythonCmd, {}, function (err, python) {
          if (err) {
            log('error', err);
          }

          cb(data, python);
        });
      }
    });
  }
};

function testPythonPath(pythonPath, cb) {
  const testPython = path.join(__dirname, 'check_python.py'),
    testPythonFile = tmp.fileSync();

  fse.copySync(testPython, testPythonFile.name);

  let testCmd, testProcess;

  if (/win32/.test(process.platform)) {
    if (/ /.test(pythonPath)) {
      testCmd = '"' + pythonPath + '"' + ' ' + testPythonFile.name;
    } else {
      testCmd = pythonPath.replace(/ /g, '\\ ') + ' ' + testPythonFile.name;
    }
  } else {
    testCmd = pythonPath.replace(/ /g, '\\ ') + ' ' + testPythonFile.name;
  }

  // escape for spaces in paths
  testProcess = exec(testCmd, { timeout: 9000 }, function (err, stdout) {
    try {
      if (err) {
        cb(err, null);
      } else {
        const result = JSON.parse(stdout);

        result.python = true;
        cb(null, result);
      }
    } catch (ex) {
      log('error', ex);
      cb(new Error('some error in python kernel handler ' + require('util').inspect({err, stdout, ex})));
    } finally {
      testProcess.kill();
    }
  });
}

module.exports.testPythonPath = testPythonPath;
