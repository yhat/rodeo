'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  client = require('./client'),
  path = require('path'),
  processes = require('../../services/processes'),
  os = require('os'),
  rules = require('../../services/rules');

/**
 * @type {[{when: *, then: *}]}
 */
let ruleSet = [
  {
    when: _.matches({platform: 'win32'}),
    then: {cmd: 'python', shell: 'cmd.exe'}
  },
  // {
  //   when: _.matches({platform: 'win32'}),
  //   then: function () {
  //     const child = processes.create('for %i in (python.exe) do @echo. %~$PATH:i');
  //
  //     child.kill();
  //   }
  // },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: 'python', shell: '/bin/bash'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '/usr/bin/python', shell: '/bin/bash'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '/usr/local/bin/python', shell: '/bin/bash'}
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
    then: function (facts) {
      return {
        cmd: path.join(facts.homedir, 'anaconda2/bin/python'),
        shell: '/bin/bash',
        label: '~/anaconda2/bin/python'
      };
    }
  }
  // {
  //   when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
  //   then: function () {
  //     const child = processes.create('which python');
  //
  //     child.kill();
  //     throw new Error('Not implemented');
  //   }
  // }
];

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
    throw new TypeError('Missing first parameter');
  }

  return bluebird.all(rules.all(ruleSet, facts)).map(function (pythonOptions) {
    return client.checkPython(pythonOptions).then(function (checkResults) {
      return {pythonOptions, checkResults};
    }).reflect().then(function (inspection) {
      return inspection.isFulfilled() && inspection.value();
    });
  }).filter(_.identity);
}

module.exports.findPythons = findPythons;
module.exports.getFacts = getFacts;
module.exports.setRuleSet = setRuleSet;
