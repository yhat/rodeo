'use strict';

const _ = require('lodash'),
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  less = require('gulp-less'),
  path = require('path'),
  sourcemaps = require('gulp-sourcemaps'),
  map = require('vinyl-map'),
  tmpAppDirectory = 'app',
  uglify = require('gulp-uglify'),
  distTasks = require('./tasks/dist'),
  karmaTasks = require('./tasks/karma'),
  lintTasks = require('./tasks/lint'),
  webpackTasks = require('./tasks/webpack'),
  outputMap = {
    app: tmpAppDirectory,
    browser: path.join(tmpAppDirectory, 'browser'),
    fonts: path.join(tmpAppDirectory, 'browser', 'fonts'),
    images: path.join(tmpAppDirectory, 'browser', 'images'),
    node: path.join(tmpAppDirectory, 'node'),
    themes: path.join(tmpAppDirectory, 'browser', 'themes')
  };

distTasks.importTasks(gulp);
karmaTasks.importTasks(gulp);
lintTasks.importTasks(gulp);
webpackTasks.importTasks(gulp, outputMap);

/**
 * Ace is so large that its easier to keep it separate.
 * Also, it minifies well, unlike other ext
 */
gulp.task('ace', function () {
  return gulp.src([
    'src/browser/ace/ace.js',
    'src/browser/ace/**/*.js'
  ]).pipe(concat('ace.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(outputMap.browser));
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
    'src/browser/jsx/lib/*.js'
  ]).pipe(concat('external.min.js'))
    .pipe(gulp.dest(outputMap.browser));
});

gulp.task('html', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.html'
  ]).pipe(gulp.dest(outputMap.browser));
});

/**
 * I don't know why less doesn't do this automatically.
 */
gulp.task('fonts', function () {
  return gulp.src([
    'node_modules/font-awesome/fonts/**/*'
  ]).pipe(gulp.dest(outputMap.fonts));
});

gulp.task('themes', ['fonts'], function () {
  return gulp.src([
    'src/browser/themes/*.less'
  ]).pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(outputMap.themes));
});

/**
 * We should eventually eliminate all of these and move them to the jsx folder so they're optimized
 */
gulp.task('images', function () {
  return gulp.src([
    'src/browser/images/**/*.{svg,gif,png}'
  ]).pipe(gulp.dest(outputMap.images));
});

/**
 * Copy the node-specific code over to the temp directory that will be distributed with a deployed app
 */
gulp.task('node', function () {
  // copy node program
  return gulp.src([
    'src/node/**/*',
    '!**/*.test*', // leave the tests behind
    '!**/*.md' // leave the documentation behind
  ]).pipe(gulp.dest(outputMap.node));
});

/**
 * Make an "app" version of the package.json according to electron-builder's arbitrary rules and put it in the
 * temp directory to be consumed by them.
 */
gulp.task('package.json', function () {
  return gulp.src('package.json')
    .pipe(map(function (chunk) {
      const pkg = JSON.parse(chunk.toString());

      pkg.main = 'node/index.js';

      return JSON.stringify(_.omit(pkg, ['devDependencies', 'build', 'bin']), null, 2);
    }))
    .pipe(gulp.dest(outputMap.app));
});

/**
 * Installs only the dependencies need to the run the app (not build the app) to the tmpAppDirectory
 * @returns {Promise}
 */
gulp.task('npm-install', function () {
  const path = tmpAppDirectory,
    args = ['--production'];

  return new Promise(function (resolve, reject) {
    require('npm-i')({path, args}, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
});

gulp.task('test', ['lint', 'karma']);
gulp.task('build', ['themes', 'external', 'images', 'ace', 'jsx', 'html', 'node', 'package.json', 'npm-install']);
gulp.task('dist', ['dist:all']);
gulp.task('default', ['test', 'build']);
