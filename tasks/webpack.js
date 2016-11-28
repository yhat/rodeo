'use strict';

const webpackStream = require('webpack-stream');

module.exports.importTasks = function (gulp, outputMap) {
  gulp.task('jsx', function () {
    return gulp.src([
      'src/browser/entry/*.js'
    ]).pipe(webpackStream(require('../webpack.config.js')))
      .pipe(gulp.dest('.'));
  });

  gulp.task('node', function () {
    return gulp.src([
      'src/node/index.js'
    ]).pipe(webpackStream(require('../webpack.main.config.js')))
      .pipe(gulp.dest('.'));
  });

  /**
   * Used for designing components on the fly
   */
  gulp.task('hot', function () {
    return gulp.src([
      'src/browser/jsx/entry/*.js'
    ]).pipe(webpackStream(require('../webpack.dev.config.js')))
      .pipe(gulp.dest(outputMap.browser));
  });
};
