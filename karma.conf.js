module.exports = function (karma) {
  karma.set({
    autoWatch: false,
    browsers: ['Chrome'],
    browserDisconnectTimeout: 5000,
    browserNoActivityTimeout: 50000,
    colors: true,
    singleRun: true,
    reporters: [
      'spec'
    ],
    files: [
      'src/**/*.js'
    ],
    frameworks: ['mocha', 'chai', 'sinon'],
    preprocessors: {},
    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-chai',
      'karma-sinon'
    ]
  });
};
