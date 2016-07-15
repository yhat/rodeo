'use strict';

module.exports = function (karma) {
  karma.set({
    autoWatch: false,
    browsers: ['Chrome'],
    browserDisconnectTimeout: 1000 * 60 * 2,
    browserNoActivityTimeout: 1000 * 60 * 5,
    colors: true,
    singleRun: true,
    logLevel: karma.LOG_DEBUG,
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
    files: [
      'node_modules/react/dist/react-with-addons.js',
      'test/**/*.js',
      'src/browser/jsx/entry**/*.js'
    ],
    frameworks: ['mocha', 'chai'],
    preprocessors: {
      '**/*.jsx': ['babel']
    },
    plugins: [
      'karma-babel-preprocessor',
      'karma-mocha-reporter',
      'karma-mocha',
      'karma-chai'
    ]
  });
};
