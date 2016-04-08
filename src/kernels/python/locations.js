'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  globby = require('globby'),
  log = require('../../rodeo/log').asInternal(__filename),
  os = require('os'),
  rules = require('../../rodeo/rules');
let locationRuleSet;

function setPath() {
  return 'set PYTHONPATH=%PYTHONPATH%;C:\My_python_lib';
}

function getPath() {
  return 'echo %PATH%';
}

function getWindowsLibPath() {
  return 'C:\\Python\\Lib\\';
}

function getWindowsThirdPartyLibPath() {
  return 'C:\\Python\\Lib\\site-packages\\';
}

locationRuleSet = [
  {
    // Windows 7
    when: function (facts) {
      return facts.type === 'Windows_NT' ||
        facts.platform === 'win32';
    },
    then: function () {
      return globby(['/Python*/']);
    }
  },
  {
    // Linux
    when: function (facts) {
      return facts.type === 'Linux' ||
        _.contains(['linux', 'freebsd', 'sunos'], facts.platform);
    },
    then: function (facts) {
      // const execPaths = [
      //     '/usr/bin/python',
      //     '/usr/local/bin/python'
      //   ],
      //   libPaths = ['/usr/lib/{python_version}'],
      //   includePaths = ['/usr/include/{python_version}'],
      //   userInitPaths = ['~/.pythonrc.py'],
      //   findPython = ['which python'],
      //   altREPLStart = ['env python'];

      return globby([
        '/usr/bin/python',
        '/lib/python*/'
      ]).then(function (results) {
        // run `which python` to collect the default

        
      });
    }
  },
  {
    // darwin/OSX
    when: function (facts) {
      return facts.type === 'Darwin' ||
        facts.platform === 'darwin';
    },
    then: function () {
      return globby([
        '/usr/bin/python',
        '/Library/Frameworks/Python.framework'
      ]);
    }
  }
];

function getModules() {
  // pip
  // pip install virtualenv

  // set virtual environment?
  // virtualenv {venv name}
  // start using the environment
  // source venv/bin/activate

  // pip all the things

  // exit environment
  // deactivate

  // it uses the `.env` in the directory

  // list packages
  // pip list

  // list outdated packages
  // pip list --outdated
}

function getFacts() {
  return {
    arch: os.arch(),
    platform: os.platform(),
    homedir: os.homedir(),
    type: os.type(),
    totalmem: os.totalmem(),
    tmpdir: os.tmpdir()
  };
}

function filterRejectedPromises(promises) {
  return _.filter(_.map(promises, function (promise) {
    if (promise.isResolved()) {
      log('info', 'resolved', promise.value());

      return promise.value();
    }

    log('warn', 'rejected', promise.reason());
  }), _.identity);
}

function getPossibleLocations() {
  const facts = getFacts(),
    selectedRules = rules.select(locationRuleSet, facts);

  return bluebird.map(selectedRules, function (rule) {
    return bluebird.method(rule.then(facts)).reflect();
  }).then(filterRejectedPromises);
}


module.exports.getFacts = getFacts;
module.exports.getPossibleLocations = getPossibleLocations;