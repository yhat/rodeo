'use strict';

module.exports = function (karma) {
  karma.set({
    autoWatch: false,
    browsers: ['Electron'],
    browserDisconnectTimeout: 5000,
    browserNoActivityTimeout: 50000,
    colors: true,
    singleRun: true,
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
