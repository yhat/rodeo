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
  var testPython = path.join(__dirname, "../src", "check_python.py");
  var testPythonFile = tmp.fileSync();
  fse.copySync(testPython, testPythonFile.name);

  var rc = getRC();
  var pythonCmds = [];
  // if we have one in our RC file, we'll prioritize that first
  if (rc.pythonCmd) {
    pythonCmds.push(rc.pythonCmd);
  }
  pythonCmds = pythonCmds.concat([
    "/usr/local/bin/ipython",
    "/anaconda/bin/python",
    path.join(USER_HOME, "anaconda", "bin", "python"),
    path.join(USER_HOME, "anaconda", "python"),
    "/usr/bin/python",
    path.join(USER_HOME, "bin", "python"),
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
        } else if (stdout.toString()!="FAIL") {
          // then we're good
        } else {
          pythonCmd = null;
        }
        callback();
      });
    },
    function(err) {
      fn(err, pythonCmd);
    }
  );
};

module.exports.findMeAPython = findMeAPython;
