var exec = require('child_process').exec;
var async = require('async');
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var tmp = require('tmp');

// Steve Irwin gets you a python, no questions asked
function findMeAPython(fn) {
  // /usr/bin/env python doesn't really work, so we're going to be doing the ole
  // guess and check method
  var testPython = path.join(__dirname, "check_python.py");

  // this needs to be a tmp file because we're shelling out and the `python`
  // command doesn't know about files in the asar
  var testPythonFile = tmp.fileSync();
  fse.copySync(testPython, testPythonFile.name);

  var rc = {}; // TODO: getRC();
  var pythonCmds = [];
  // if we have one in our RC file, we'll prioritize that first
  if (rc.pythonCmd) {
    pythonCmds.push(rc.pythonCmd);
  }

  var cmd;
  if (/^win/.test(process.platform)) {
    cmd = "echo %path%";
  } else {
    cmd = "source ~/.bash_profile > /dev/null && echo $PATH";
  }
  exec(cmd, function(err, stdout, stderr) {
    var opts = {};
    if (stdout) {
      var userPath = stdout.toString().trim();
      opts = {
        env: {
          PATH: userPath
        }
      };
    }
    exec("python -c 'import sys; print(sys.executable)'", opts, function(err, stdout, stderr) {
      if (opts.env && stdout) {
        pythonCmds.push(stdout.toString().trim());
      }

      pythonCmds = pythonCmds.concat([
        "/usr/local/bin/ipython",
        "/anaconda/bin/python",
        // path.join(USER_HOME, "anaconda", "bin", "python"),
        // path.join(USER_HOME, "anaconda", "python"),
        "/usr/bin/python",
        // path.join(USER_HOME, "bin", "python"),
        "python"
      ]);

      var i = 0;
      var pythonCmd;
      async.whilst(
        function() {
          if (pythonCmds.length==i) {
            return false;
          } else if (pythonCmd==null) {
            return true;
          }
        },
        function(callback) {
          pythonCmd = pythonCmds[i];
          i++;
          exec(pythonCmd + " " + testPythonFile.name, function(err, stdout, stderr) {
            if (err) {
              pythonCmd = null;
              callback();
            } else if (! /FAIL/.test(stdout.toString())) {
              // then we're good
              callback();
            } else if (stdout.toString()=="FAIL-jupyter"){
              pythonCmd = null;
              callback("Could not load Jupyter/IPython");
            } else if (stdout.toString()=="FAIL-matplotlib"){
              pythonCmd = null;
              callback("Could not load matplotlib");
            }
          });
        },
        function(err) {
          fn(err, pythonCmd, opts);
        }
      );
    });
  });
};

module.exports.findMeAPython = findMeAPython;
