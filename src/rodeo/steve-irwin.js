var path = require('path');
var fse = require('fs-extra');
var tmp = require('tmp');
var execSync = require('child_process').execSync;
var preferences = require('./preferences');

USER_HOME = "/Users/glamp/"

function getUserPath() {
  var cmd;
  if (/^win/.test(process.platform)) {
    cmd = "echo %path%";
  } else if (process.platform=="linux") {
    cmd = "bash -c 'source ~/.bashrc > /dev/null && echo $PATH'";
  } else {
    cmd = "source ~/.bash_profile && source ~/.bashrc > /dev/null && echo $PATH";
  }
  try {
    return execSync(cmd, { timeout: 2000 }).toString();
  } catch (e) {
    console.error("[ERROR]: " + e.toString());
    return null;
  }
}

function getDefaultPython(opts) {
  try {
    return execSync("python -c 'import sys; print(sys.executable)'", opts).toString().trim();
  } catch (e) {
    return null;
  }
}

function findMeAPython(fn) {
  var testPython = path.join(__dirname, "check_python.py");
  var testPythonFile = tmp.fileSync();
  fse.copySync(testPython, testPythonFile.name);

  var rc = preferences.getPreferences();

  var pythonCmds = [];
  if (rc.pythonCmd) {
    console.log("[INFO]: found default python in rc file: " + rc.pythonCmd);
    pythonCmds.push(rc.pythonCmd);
  }

  var opts = {};
  var userPath = getUserPath();
  if (userPath) {
    opts = { env: { PATH: userPath } };
  }

  var defaultPython = getDefaultPython(opts);

  if (defaultPython) {
    pythonCmds.push(defaultPython);
  }

  pythonCmds.push("/home/sciencecluster/.anaconda2/bin/python");
  pythonCmds.push("/root/miniconda2/bin/python");
  pythonCmds.push("/usr/local/bin/ipython");
  pythonCmds.push("/anaconda/bin/python");
  pythonCmds.push("/usr/bin/python");
  // pythonCmds.push("python");

  for(var i=0; i<pythonCmds.length; i++) {
    var pythonCmd = pythonCmds[i];

    var result;
    try {
      var result = execSync(pythonCmd.replace(/ /g, '\\ ') + " " + testPythonFile.name, { timeout: 4000 });
      result = JSON.parse(result);
    } catch (e) {
      result = { error: e.toString() };
    } finally {
      if (result.jupyter==true && result.matplotlib==true) {
        fn(null, pythonCmd, opts);
        return;
      }
    }
  }
  fn("could not find a valid python path", null, null);
};

module.exports.findMeAPython = findMeAPython;
