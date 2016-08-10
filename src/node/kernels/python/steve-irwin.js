'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  client = require('./client'),
  log = require('../../services/log').asInternal(__filename),
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
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: function () {
      // run 'which python' and use that result as their python instance
      return processes.exec('which', ['python']).then(function (results) {
        return {cmd: _.trim(results.stdout), shell: '/bin/bash', label: 'which python'};
      }).timeout(2000, 'Unable to run "which python" in under 2 seconds');
    }
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: 'python', shell: '/bin/bash', label: 'python'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '~/anaconda/bin/python', shell: '/bin/bash', label: 'anaconda'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '~/anaconda2/bin/python', shell: '/bin/bash', label: 'anaconda2'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '~/anaconda3/bin/python', shell: '/bin/bash', label: 'anaconda3'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '/usr/bin/python', shell: '/bin/bash', label: '/usr/bin/python'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '/usr/local/bin/python', shell: '/bin/bash', label: '/usr/local/bin/python'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '~/.anaconda/bin/python', shell: '/bin/bash', label: '~/.anaconda/bin/python'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '~/.anaconda2/bin/python', shell: '/bin/bash', label: '~/.anaconda2/bin/python'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '~/.anaconda3/bin/python', shell: '/bin/bash', label: '~/.anaconda3/bin/python'}
  },
  {
    when: _.overSome(_.matches({platform: 'linux'}), _.matches({platform: 'darwin'})),
    then: {cmd: '~/miniconda2/bin/python', shell: '/bin/bash', label: '~/miniconda2/bin/python'}
  }
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
 * @returns {Promise}
 */
function findPythons(facts) {
  if (!facts) {
    throw new TypeError('Missing first parameter');
  }

  const ruleResults = rules.all(ruleSet, facts);

  return bluebird.all(ruleResults)
    .then(function (resolveResults) {
      log('info', 'findPythons', {resolveResults});
      return resolveResults;
    })
    .map(function (pythonOptions) {
      return client.check(pythonOptions)
        .then(function (checkResults) {
          if (!checkResults.hasJupyterKernel) {
            throw new Error('Missing Jupyter/IPython Kernel');
          }

          return {pythonOptions, checkResults};
        })
        .reflect()
        .then(function (inspection) {
          if (inspection.isRejected()) {
            let rejected = inspection.reason();

            if (rejected.message) {
              rejected = rejected.message;
            }

            log('info', 'findPythons', {pythonOptions, rejected});
          } else {
            const value = inspection.value();

            log('info', 'findPythons', {pythonOptions, value});
            return value;
          }
        });
    })
    .filter(_.identity);
}

module.exports.findPythons = findPythons;
module.exports.getFacts = getFacts;
module.exports.setRuleSet = setRuleSet;
