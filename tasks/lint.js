'use strict';

const eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulpUtil = require('gulp-util');

/**
 * @param {Array} glob
 * @param {string} config
 * @returns {Promise}
 */
function runESLint(glob, config) {
  return globby(glob).then(function (paths) {
    let code = eslint.execute(['--config="' + config + '"', '--no-eslintrc'].concat(paths).join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gulpUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
}

module.exports.importTasks = function (gulp) {
  gulp.task('lint:browser', function () {
    return runESLint([
      'src/browser/**/*.jsx',
      'src/browser/**/*.js',
      '!**/lib/*', // ignore everything in a lib folder, because that's third party (not us)
      '!src/browser/ace/**/*'
    ], '.eslintrc');
  });

  gulp.task('lint:node', function () {
    return runESLint([
      'src/node/**/*.js',
      'karma*.conf.js',
      'gulpfile.js',
      'Gruntfile.js',
      'scripts/**/*.js'
    ], '.eslintrc-node');
  });

  gulp.task('lint', ['lint:browser', 'lint:node']);
};

