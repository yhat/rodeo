'use strict';

const path = require('path'),
  fse = require('fs-extra'),
  tmp = require('tmp'),
  log = require('../../services/log').asInternal(__filename),
  execSync = require('child_process').execSync,
  preferences = require('./../../services/preferences');

function getUserPath() {
  let cmd;

  if (/^win/.test(process.platform)) {
    cmd = 'echo %path%';
  } else if (process.platform == 'linux') {
    cmd = 'bash -c \'source ~/.bashrc > /dev/null && echo $PATH\'';
  } else {
    cmd = 'source ~/.bash_profile && source ~/.bashrc > /dev/null && echo $PATH';
  }
  try {
    return execSync(cmd, { timeout: 2000 }).toString();
  } catch (e) {
    log('error', e);
    return null;
  }
}

function getDefaultPython(opts) {
  try {
    return execSync('python -c \'import sys; print(sys.executable)\'', opts).toString().trim();
  } catch (e) {
    return null;
  }
}

function findMeAPython(fn) {
  const testPython = path.join(__dirname, 'check_python.py'),
    testPythonFile = tmp.fileSync(),
    rc = preferences.getPreferences(),
    pythonCmds = [];
  let defaultPython, opts, userPath;

  fse.copySync(testPython, testPythonFile.name);

  if (rc.pythonCmd) {
    log('info', 'found default python in rc file: ' + rc.pythonCmd);
    pythonCmds.push(rc.pythonCmd);
  }

  opts = {};
  userPath = getUserPath();

  if (userPath) {
    opts = { env: { PATH: userPath } };
  }

  defaultPython = getDefaultPython(opts);
  if (defaultPython) {
    pythonCmds.push(defaultPython);
  }

  pythonCmds.push('/home/sciencecluster/.anaconda2/bin/python');
  pythonCmds.push('/root/miniconda2/bin/python');
  pythonCmds.push('/usr/local/bin/ipython');
  pythonCmds.push('/anaconda/bin/python');
  pythonCmds.push('/usr/bin/python');
  // pythonCmds.push("python");

  for (let i = 0; i < pythonCmds.length; i++) {
    const pythonCmd = pythonCmds[i];
    let result;

    try {
      result = execSync(pythonCmd.replace(/ /g, '\\ ') + ' ' + testPythonFile.name, { timeout: 4000 });

      result = JSON.parse(result);
    } catch (e) {
      result = { error: e.toString() };
    }

    if (result.jupyter == true && result.matplotlib == true) {
      fn({ python: true, jupyter: true }, pythonCmd, opts);

      return;
    }
  }
  fn({ python: false, jupyter: false }, null, null);
}

module.exports.findMeAPython = findMeAPython;
