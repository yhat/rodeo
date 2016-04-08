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
      'dots'
    ],
    files: [
      'test/**/*.js',
      'src/**/*.js'
    ],
    frameworks: ['mocha', 'chai'],
    preprocessors: {
      '**/*.js': ['electron']
    },
    plugins: [
      'karma-electron',
      'karma-mocha',
      'karma-chai'
    ]
  });
};
