var fs = require('fs')
  , fse = require('fs-extra')
  , path = require('path')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , uuid = require('uuid')
  , tmp = require('tmp')
  , colors = require('colors')
  , StreamSplitter = require('stream-splitter')
  , SteveIrwin = require('./steve-irwin');


global.completionCallbacks = {};
var errNotReady = { stream: null, image: null, error: "Python is still starting up. Please wait a moment...", output: "" };

function spawnPython(cmd, opts, done) {
  // we need to actually write the python kernel to a tmp file. this is so python
  // can run as a "real" file and not an asar file
  var pythonKernel = path.join(__dirname, "kernel", "asynckernel.py");
  var kernelDir = path.join(__dirname, "kernel");
  var tmpKernelDir = tmp.dirSync();
  fse.copySync(kernelDir, tmpKernelDir.name);

  var kernelFile = path.join(tmpKernelDir.name, "asynckernel.py");
  var configFile = path.join(tmpKernelDir.name, "config.json");
  var delim = "\n";

  // cmd = cmd.replace(/ /g, '\\ ');
  console.log("[INFO]: starting python using PYTHON='" + cmd + "'");
  console.log("[INFO]: starting python using OPTIONS='" + JSON.stringify(opts) + "'");

  var args = [ kernelFile, configFile, delim ];
  opts.stdio = [null, null, null, 'ipc'];

  var python = spawn(cmd, args, opts);

  // we'll print any feedback from the kernel as yellow text
  python.stderr.on("data", function(data) {
    console.log("[KERNEL-STDERR]: " + data.toString().yellow);
  });

  python.on("error", function(err) {
    console.log("[KERNEL-ERROR]: " + err.toString());
  });

  python.on("exit", function(code) {
    fs.unlink(kernelFile, function(err) {
      if (err) {
        console.log("[KERNEL-ERROR]: failed to remove temporary kernel file: " + err);
      }
    });
    console.log("[KERNEL-INFO]: exited with code: " + code);
  });

  python.on("close", function(code) {
    console.log("[KERNEL-INFO]: closed with code: " + code);
  });

  python.on("disconnect", function() {
    console.log("[KERNEL-INFO]: disconnected");
  });

  // StreamSplitter looks at the incoming stream from asynckernel.py (which is line
  // delimited JSON) and splits on \n automatically, so we're just left with the
  // JSON data
  python.stdout.pipe(StreamSplitter(delim))
    .on("token", function(data) {
      var result = JSON.parse(data.toString());
      if (result.id in completionCallbacks) {
        completionCallbacks[result.id](result);
        if (result.status=="complete") {
          delete completionCallbacks[result.id];
        }
      } else {
        console.log("[ERROR]: " + "callback not found for: " + result.id + " --> " + JSON.stringify(result));
      }
    });
  python.execute = function(cmd, complete, fn) {
    if (this.stdin.writable==false) {
      if (fn) {
        fn(errNotReady);
      }
      return;
    }
    var payload = { async: false, id: uuid.v4().toString(), code: cmd, complete: complete };
    var output = "";
    completionCallbacks[payload.id] = function(result) {
      // autocompleted results come back as a proper JSON array
      if (complete==true) {
        output = result.output;
      } else {
        output = output + (result.output || "");
      }
      if (result.status=="complete") {
        if (fn) {
          fn(result);
        }
      }
    }
    this.stdin.write(JSON.stringify(payload) + delim);
  };

  python.executeStream = function(cmd, complete, fn) {
    if (this.stdin.writable==false) {
      fn(errNotReady);
      return;
    }
    var payload = { async: true, id: uuid.v4().toString(), code: cmd, complete: complete };
    completionCallbacks[payload.id] = fn
    this.stdin.write(JSON.stringify(payload) + delim);
  };

  var profileFilepath = path.join(USER_HOME, ".rodeoprofile");

  if (! fs.existsSync(profileFilepath)) {
    var defaultProfilePath = path.join(__dirname, "default-rodeo-profile.txt");
    var defaultProfile = fs.readFileSync(defaultProfilePath).toString();
    fs.writeFileSync(profileFilepath, defaultProfile);
  }
  var rodeoProfile = fs.readFileSync(profileFilepath).toString();

  // wait for the python child to emit a message. once it does (it'll be
  // something simple like {"status": "OK"}, then we know it's running
  // and we can start Rodeo
  // TODO: this does not work on windows
  var hasStarted = false;
  python.on('message', function(msg) {
    console.error("[INFO]: kernel is running");
    python.execute(rodeoProfile, false, function(resutls) {
      hasStarted = true;
      done(null, python);
    });
  });
  // TODO: this is happening every time on Windows. fuck you windows
  setTimeout(function() {
    if (hasStarted==false) {
      done("Could not start Python kernel", null);
    }
  }, 7500);

}

module.exports.startNewKernel = function(pythonCmd, cb) {
  if (! pythonCmd) {
    SteveIrwin.findMeAPython(function(err, pythonCmd, opts) {

      if (err.python==false || err.jupyter==false) {
        cb(err, { spawnfile: pythonCmd });
      } else {
        spawnPython(pythonCmd, opts, function(err, python) {
          cb({ python: true, jupyter: true }, python);
        });
      }
    });
  } else {
    testPythonPath(pythonCmd, function(err, result) {
      if (! result) {
        result = { jupyter: false, python: false };
      }
      var data = {
        python: err==null,
        jupyter: result.jupyter==true
      }

      if (err) {
        console.log("[ERROR-CRITICAL]:  could not start subprocess: " + err.toString());
        cb(data, null);
      } else if (result.jupyter==false) {
        cb(data, null);
      } else {
        spawnPython(pythonCmd, {}, function(err, python) {
          console.log(err, python);
          cb(data, python);
        });
      }
    });
  }
};

function testPythonPath(pythonPath, cb) {
  var testPython = path.join(__dirname, "check_python.py");
  var testPythonFile = tmp.fileSync();
  fse.copySync(testPython, testPythonFile.name);

  var testCmd;
  if (/win32/.test(process.platform)) {
    if (/ /.test(pythonPath)) {
      testCmd = '"' + pythonPath + '"' + " " + testPythonFile.name;
    } else {
      testCmd = pythonPath.replace(/ /g, '\\ ') + " " + testPythonFile.name;
    }
  } else {
    testCmd = pythonPath.replace(/ /g, '\\ ') + " " + testPythonFile.name;
  }

  // escape for spaces in paths
  var testProcess = exec(testCmd, { timeout: 9000 }, function(err, stdout, stderr) {
    if (err) {
      cb(err, null);
      testProcess.kill();
    } else {
      var result = JSON.parse(stdout.toString());
      result.python = true;
      cb(null, result);
      testProcess.kill();
    }
  });
};

module.exports.testPythonPath = testPythonPath;
