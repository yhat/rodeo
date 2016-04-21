'use strict';

module.exports = function (karma) {
  karma.set({
    autoWatch: false,
    browsers: ['CustomElectron'],
    browserDisconnectTimeout: 1000 * 60 * 2,
    browserNoActivityTimeout: 1000 * 60 * 5,
    colors: true,
    singleRun: true,
    // logLevel: karma.LOG_DEBUG,
    reporters: [
      'mocha'
    ],
    specReporter: {
      suppressErrorSummary: false,  // do not print error summary
      suppressFailed: false,  // do not print information about failed tests
      suppressPassed: false,  // do not print information about passed tests
      suppressSkipped: false,  // do not print information about skipped tests
      showSpecTiming: true // print the time elapsed for each spec
    },
    mochaReporter: {
      showDiff: true
    },
    customLaunchers: {
      CustomElectron: {
        base: 'Electron',
        flags: ['--enable-logging']
      }
    },
    files: [
      'test/**/*.js',
      'src/**/*.js'
    ],
    frameworks: ['mocha', 'chai'],
    preprocessors: {
      '**/*.js': ['electron']
    },
    plugins: [
      'karma-mocha-reporter',
      'karma-electron',
      'karma-mocha',
      'karma-chai'
    ]
  });
};
