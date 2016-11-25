'use strict';

const builder = require('electron-builder');

module.exports.importTasks = function (gulp) {
  /**
   * Regular build, plus extras needed to package and distribute app
   *
   * Remember to set your CSC_NAME or CSC_LINK for code signing!
   * i.e., CSC_NAME="Dane Stuckel" <command>
   *
   * @returns {Promise}
   */
  gulp.task('dist:all', function () {
    return builder.build({
      asar: false,
      prune: true,
      platform: ['all'],
      arch: 'x64', // for all platforms and architectures
      dist: true, // compile all that we can
      devMetadata: require('../package.json').build
    });
  });

  /**
   * Regular build, plus extras needed to package and distribute app
   *
   * Remember to set your CSC_NAME or CSC_LINK for code signing!
   * i.e., CSC_NAME="Dane Stuckel" <command>
   *
   * @returns {Promise}
   */
  gulp.task('dist:osx', function () {
    return builder.build({
      asar: false,
      prune: true,
      platform: ['darwin'],
      arch: 'x64',
      dist: true, // compile all that we can
      devMetadata: require('../package.json').build
    });
  });

  /**
   * Regular build, plus extras needed to package and distribute app
   *
   * Remember to set your CSC_NAME or CSC_LINK for code signing!
   * i.e., CSC_NAME="Dane Stuckel" <command>
   *
   * @returns {Promise}
   */
  gulp.task('dist:win', function () {
    return builder.build({
      asar: true,
      prune: true,
      platform: ['win'],
      arch: 'x64',
      dist: true, // compile all that we can
      devMetadata: require('../package.json').build
    });
  });

  /**
   * Regular build, plus extras needed to package and distribute app
   *
   * Remember to set your CSC_NAME or CSC_LINK for code signing!
   * i.e., CSC_NAME="Dane Stuckel" <command>
   *
   * @returns {Promise}
   */
  gulp.task('dist:linux', function () {
    return builder.build({
      asar: false,
      prune: true,
      platform: ['linux'],
      arch: 'x64',
      dist: true, // compile all that we can
      devMetadata: require('../package.json').build
    });
  });
};
