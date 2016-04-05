'use strict';

const eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulp = require('gulp'),
  gUtil = require('gutil'),
  jsPatterns = [
    'Gruntfile.js',
    'scripts/**/*.js'
    // 'src/**/*.js'
  ];

gulp.task('eslint', function () {
  console.log('eslint globbing', jsPatterns);
  return globby(jsPatterns).then(function (paths) {
    console.log('eslint', paths);
    // additional CLI options can be added here
    let code = eslint.execute(paths.join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
});

gulp.task('lint', ['eslint']);
gulp.task('test', ['lint']);
gulp.task('build', []);
gulp.task('run', []);
gulp.task('watch', function () {
  gulp.watch('components/myjs.js', ['lint']);
});
gulp.task('default', ['test', 'build', 'run']);
