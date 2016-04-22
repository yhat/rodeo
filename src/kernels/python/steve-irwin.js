'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  client = require('./client'),
  path = require('path'),
  fse = require('fs-extra'),
  tmp = require('tmp'),
  log = require('../../services/log').asInternal(__filename),
  execSync = require('child_process').execSync,
  os = require('os'),
  rules = require('../../services/rules'),
  preferences = require('../../services/preferences');

let ruleSet = [
  {
    when: _.matches({platform: 'win32'}),
    then: {cmd: 'python', shell: 'cmd.exe'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '//home/sciencecluster/.anaconda2/bin/python', shell: '/bin/bash'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '/root/miniconda2/bin/python', shell: '/bin/bash'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '/anaconda/bin/python', shell: '/bin/bash'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '/usr/local/bin/python', shell: '/bin/bash'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '/usr/bin/python', shell: '/bin/bash'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: 'python', shell: '/bin/bash'}
  }
];

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

/**
 * @deprecated
 * @param {function} fn
 */
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

/**
 * @returns {{arch: string, platform: string, homedir: string, type: string, tmpdir: string}}
 */
function getFacts() {
  return _.pickBy({
    arch: os.arch(),
    platform: os.platform(),
    homedir: os.homedir(),
    type: os.type(),
    tmpdir: os.tmpdir()
  }, _.identity);
}

function setRuleSet(value) {
  ruleSet = value;
}

/**
 * Return all paths that can run python successfully, along with the packages in each python setup
 * @param {object} facts
 * @returns {[string]}
 */
function findPythons(facts) {
  if (!facts) {
    throw new TypeError('You need facts.');
  }

  return bluebird.all(rules.all(ruleSet, facts)).map(function (pythonOptions) {
    return client.checkPython(pythonOptions).then(function (checkResults) {
      return {pythonOptions, checkResults};
    }).reflect().then(function (inspection) {
      return inspection.isFulfilled() && inspection.value();
    });
  }).filter(_.identity);
}

module.exports.findMeAPython = findMeAPython;
module.exports.findPythons = findPythons;
module.exports.getFacts = getFacts;
module.exports.setRuleSet = setRuleSet;
