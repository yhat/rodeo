/**
 * ```bash
 * npm install -g babel-cli
 * babel-node test/browser
 * ```
 *
 * @module
 * @see https://medium.com/@TomazZaman/how-to-get-fast-unit-tests-with-out-webpack-793c408a076f#.6vviyy322
 */

import {resolve} from 'path';
import assert from 'assert';
import Module from 'module';
import jsdom from 'jsdom';
import Mocha from 'mocha';
import chokidar from 'chokidar';

// Let's import and globalize testing tools so
// there's no need to require them in each test
import sinon from 'sinon';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import MockAce from './mocks/ace';
import MockIpc from './mocks/ipc';
import MockStorage from './mocks/storage';

const persistent = true,
  mocks = {
    ace: MockAce,
    ipc: MockIpc
  };

// Environment setup (used by Babel as well, see .babelrc)
process.env['NODE_ENV'] = 'test';

/**
 * Monkey-patching the Function prototype so we can have require.ensure working.
 * Easier achieved than hacking the Module for targeting the "require" specifically.
 * @param {Array} arr
 * @param {function} func
 * @returns {*}
 */
Function.prototype.ensure = (arr, func) => func();

/**
 * Monkey-patching native require, because Webpack supports requiring files, other
 * than JavaScript. But Node doesn't recognize them, so they should be ignored.
 * IMPORTANT: don't use arrow functions because they change the scope of 'this'!
 * @param {string} path
 * @returns {*}
 */
Module.prototype.require = function (path) {
  console.log('requiring', path);

  const types = /\.(s?css|sass|less|svg|html|png|jpe?g|gif|md)$/;

  if (path.search(types) !== -1) return;
  if (mocks[path]) return mocks[path];

  // Mimics Webpack's "alias" feature
  if (path === 'config') {
    path = resolve('./src/js/secrets/test.js');
  }

  assert(typeof path === 'string', 'path must be a string');
  assert(path, 'missing path');

  return Module._load(path, this);
};

// setup the simplest document possible
(function () {
  let doc = jsdom.jsdom('<!doctype html><html><body></body></html>'),
    win = doc.defaultView;

  win.localStorage = new MockStorage();
  win.sessionStorage = new MockStorage();

  // set globals for mocha that make access to document and window feel
  // natural in the test environment
  global.document = doc;
  global.window = win;
  global.self = global;
  global.chai = chai;
  global.expect = expect;
  global.sinon = sinon;

  /**
   * Take all the properties of the window object and attach them to the mocha
   * global object. This is to prevent 'undefined' errors which sometime occur.
   * Gotten from: http://jaketrent.com/post/testing-react-with-jsdom/
   * @param  {object} window: The fake window, build by jsdom
   */

  for (let key in win) {
    if (!win.hasOwnProperty(key)) continue;
    if (key in global) continue;
    global[key] = win[key];
  }
}());

(function () {
  let fileList = [];

  /**
   * A helper function to run Mocha tests. Since Mocha doesn't support changing
   * tested files dynamically (except for adding), we need to clear require's
   * cache on every run and instantiate a new runner.
   */
  function runSuite() {
    const mocha = new Mocha({reporter: 'dot'});

    Object.keys(require.cache).forEach(key => delete require.cache[key]);
    fileList.forEach(filepath => mocha.addFile(filepath));
    mocha.run();
  }

  /**
   * Chokidar watches all the files for any kind of change and calls the run function
   * from above. Read more: https://github.com/paulmillr/chokidar
   * @param  {string} a glob of files to watch
   * @param  {object} settings
   */
  chokidar.watch('src/browser/jsx/**/*.test.js', {persistent})
    .on('add', function (filePath) {
      console.log('add', {filePath});
      fileList.push(filePath);
    })
    .on('change', function (filePath) {
      console.log('change', {filePath});
      runSuite();
    })
    .on('ready', function () {
      console.log('ready');
      runSuite();
    });

  chokidar.watch('src/browser/jsx/**/*.js', {persistent})
    .on('change', function (filePath) {
      console.log('change', {filePath});
      runSuite();
    });
}());

