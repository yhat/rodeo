'use strict';

const eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  gulpUtil = require('gulp-util'),
  karma = require('karma'),
  uglify = require('gulp-uglify'),
  KarmaServer = karma.Server,
  path = require('path'),
  jsPatterns = [
    'karma.conf.js',
    'gulpfile.js',
    'Gruntfile.js',
    'scripts/**/*.js',
    'src/**/*.js'
  ];

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

gulp.task('eslint', function () {
  return globby(jsPatterns).then(function (paths) {
    // additional CLI options can be added here
    let code = eslint.execute(paths.join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gulpUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
});

gulp.task('karma-main', function () {
  return runKarma('karma.main.conf.js');
});

gulp.task('karma-renderer', function () {
  return runKarma('karma.renderer.conf.js');
});

gulp.task('external-scripts', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/react/dist/react-with-addons.min.js',
    'node_modules/react-dom/dist/react-dom.min.js',
    'public/js/lib/owl.carousel.js'
  ]).pipe(concat('external.min.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('jsx', function () {
  return gulp.src([
    'public/js/window.ipc.js',
    'public/jsx/**/*.jsx'
  ]).pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('jsx.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('lint', ['eslint']);
gulp.task('test', ['lint', 'karma-renderer', 'karma-main']);
gulp.task('build', ['external-scripts', 'jsx']);
gulp.task('run', []);
gulp.task('watch', function () {
  gulp.watch('public/**/*.js', ['karma-renderer']);
  gulp.watch('src/**/*.js', ['karma-main']);
});
gulp.task('default', ['test', 'build', 'run']);
