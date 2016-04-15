'use strict';

module.exports = function (karma) {
  karma.set({
    autoWatch: false,
    browsers: ['Electron'],
    browserDisconnectTimeout: 1000 * 60 * 2,
    browserNoActivityTimeout: 1000 * 60 * 5,
    colors: true,
    singleRun: true,
    logLevel: karma.LOG_INFO,
    reporters: [
      'mocha'
    ],
    specReporter: {
      maxLogLines: 10,         // limit number of lines logged per test
      suppressErrorSummary: false,  // do not print error summary
      suppressFailed: false,  // do not print information about failed tests
      suppressPassed: false,  // do not print information about passed tests
      suppressSkipped: false,  // do not print information about skipped tests
      showSpecTiming: true // print the time elapsed for each spec
    },
    mochaReporter: {
      showDiff: true
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
      'karma-spec-reporter',
      'karma-electron',
      'karma-mocha',
      'karma-chai'
    ]
  });
};
