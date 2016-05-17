'use strict';

const _ = require('lodash'),
  builder = require('electron-builder'),
  eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  gulpUtil = require('gulp-util'),
  karma = require('karma'),
  less = require('gulp-less'),
  KarmaServer = karma.Server,
  npmInstall = require('npm-i'),
  path = require('path'),
  sourcemaps = require('gulp-sourcemaps'),
  webpackStream = require('webpack-stream'),
  map = require('vinyl-map'),
  tmpBuildDirectory = 'build',
  tmpAppDirectory = 'app',
  tmpBrowserDirectory = path.join(tmpAppDirectory, 'browser');

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
    .pipe(gulp.dest(tmpBrowserDirectory));
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
    .pipe(gulp.dest(tmpBrowserDirectory));
});

gulp.task('html', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.html'
  ]).pipe(gulp.dest(tmpBrowserDirectory));
});

/**
 * I don't know why less doesn't do this automatically.
 */
gulp.task('fonts', function () {
  return gulp.src([
    'node_modules/font-awesome/fonts/**/*'
  ]).pipe(gulp.dest(path.join(tmpBrowserDirectory, 'fonts')));
});

gulp.task('themes', ['fonts'], function () {
  return gulp.src([
    'src/browser/themes/*.less'
  ]).pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(tmpBrowserDirectory, 'themes')));
});

gulp.task('jsx', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.js'
  ]).pipe(webpackStream(require('./webpack.config.js')))
    .pipe(gulp.dest(tmpBrowserDirectory));
});

gulp.task('hot', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.js'
  ]).pipe(webpackStream(require('./webpack.dev.config.js')))
    .pipe(gulp.dest(tmpBrowserDirectory));
});

gulp.task('images', function () {
  return gulp.src([
    'src/browser/images/**/*.{svg,gif,png}'
  ]).pipe(gulp.dest(path.join(tmpBrowserDirectory, 'images')));
});

gulp.task('node', function () {
  // copy node program
  return gulp.src([
    'src/node/**/*',
    '!**/*.test*', // leave the tests behind
    '!**/*.md' // leave the documentation behind
  ]).pipe(gulp.dest(path.join(tmpAppDirectory, 'node')));
});

gulp.task('build-resources', function () {
  return gulp.src(['src/build/**/*'])
    .pipe(gulp.dest(tmpBuildDirectory));
});

gulp.task('package.json', function () {
  return gulp.src('package.json')
    .pipe(map(function (chunk) {
      const pkg = JSON.parse(chunk.toString());

      pkg.main = 'node/index.js';

      return JSON.stringify(_.omit(pkg, ['devDependencies', 'build', 'bin']), null, 2);
    }))
    .pipe(gulp.dest(tmpAppDirectory));
});

/**
 * Remember to set your CSC_NAME or CSC_LINK
 * i.e., CSC_NAME="Dane Stuckel" gulp dist
 */
gulp.task('dist', ['test', 'build'], function () {
  return new Promise(function (resolve, reject) {
    npmInstall({path: tmpAppDirectory}, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  }).then(function () {
    return builder.build({
      platform: [
        builder.Platform.OSX,
        builder.Platform.LINUX
      ],
      devMetadata: require('./package.json').build
    });
  });
});

gulp.task('test', ['eslint-node', 'eslint-browser', 'karma-browser', 'karma-node']);
gulp.task('build', ['themes', 'external', 'images', 'ace', 'jsx', 'html', 'node', 'package.json', 'build-resources']);
gulp.task('run', []);
gulp.task('watch', function () {
  gulp.watch(['public/js/**/*.js'], ['js']);
  gulp.watch(['public/jsx/**/*.svg'], ['images']);
  gulp.watch(['public/jsx/**/*.less'], ['styles']);
  gulp.watch(['public/jsx/**/*.js', 'public/jsx/**/*.jsx'], ['jsx', 'karma-renderer']);
  gulp.watch(['src/**/*.js'], ['karma-main']);
});
gulp.task('default', ['test', 'build', 'run']);
