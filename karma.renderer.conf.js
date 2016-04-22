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
    reactPreprocessor: {
      harmony: true,
      es6module: true
    },
    customLaunchers: {
      CustomElectron: {
        base: 'Electron',
        flags: ['--enable-logging']
      }
    },
    files: [
      'node_modules/react/dist/react-with-addons.js',
      'test/**/*.js',
      'public/jsx/**/*.js',
      'public/jsx/**/*.jsx'
    ],
    frameworks: ['mocha', 'chai'],
    preprocessors: {
      '**/*.js': ['electron'],
      '**/*.jsx': ['babel', 'electron']
    },
    plugins: [
      'karma-babel-preprocessor',
      'karma-mocha-reporter',
      'karma-electron',
      'karma-mocha',
      'karma-chai'
    ]
  });
};
