'use strict';

const eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  gulpUtil = require('gulp-util'),
  karma = require('karma'),
  less = require('gulp-less'),
  KarmaServer = karma.Server,
  path = require('path'),
  sourcemaps = require('gulp-sourcemaps'),
  webpack = require('webpack-stream');

gulp.task('eslint-browser', function () {
  return globby([
    'src/browser/**/*.jsx',
    'src/browser/**/*.js',
    '!**/lib/*',
    '!src/browser/js/**/*',
    '!src/browser/hbs/**/*',
    '!src/browser/ace/**/*'
  ]).then(function (paths) {
    // additional CLI options can be added here

    let code = eslint.execute(['--config .eslintrc'].concat(paths).join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gulpUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
});

gulp.task('eslint-node', function () {
  return globby([
    'src/node/**/*.js',
    'karma*.conf.js',
    'gulpfile.js',
    'Gruntfile.js',
    'scripts/**/*.js'
  ]).then(function (paths) {
    // additional CLI options can be added here
    let code = eslint.execute(['--config=".eslintrc-node"', '--no-eslintrc'].concat(paths).join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gulpUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
});

/**
 *
 * @param {string} configFile
 * @returns {Promise}
 */
function runKarma(configFile) {
  return new Promise(function (resolve, reject) {
    const server = new KarmaServer({
      configFile: path.join(__dirname, configFile),
      singleRun: true
    }, function () {
      reject();
    });

    server.start();
  });
}

gulp.task('karma-node', function () {
  return runKarma('karma.node.conf.js');
});

gulp.task('karma-browser', function () {
  return runKarma('karma.browser.conf.js');
});

/**
 * Ace is so large that its easier to keep it separate.
 */
gulp.task('ace', function () {
  return gulp.src([
    'src/browser/ace/ace.js',
    'src/browser/ace/**/*.js'
  ]).pipe(concat('ace.min.js'))
    .pipe(gulp.dest('dist'));
});

/**
 * This files should be included in every screen, and have already been processed, so keep it separate.
 */
gulp.task('external', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/react/dist/react-with-addons.js',
    'node_modules/react-dom/dist/react-dom.js',
    'public/js/lib/*.js'
  ]).pipe(concat('external.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('html', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.html'
  ]).pipe(gulp.dest('dist'));
});

gulp.task('themes', function () {
  return gulp.src([
    'src/browser/themes/*.less'
  ]).pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('webpack', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.js'
  ]).pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', ['eslint-node', 'eslint-browser', 'karma-browser', 'karma-node']);
gulp.task('build', ['themes', 'external', 'ace', 'webpack', 'html']);
gulp.task('run', []);
gulp.task('watch', function () {
  gulp.watch(['public/js/**/*.js'], ['js']);
  gulp.watch(['public/jsx/**/*.svg'], ['images']);
  gulp.watch(['public/jsx/**/*.less'], ['styles']);
  gulp.watch(['public/jsx/**/*.js', 'public/jsx/**/*.jsx'], ['jsx', 'karma-renderer']);
  gulp.watch(['src/**/*.js'], ['karma-main']);
});
gulp.task('default', ['test', 'build', 'run']);
