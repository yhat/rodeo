import { startPrompt } from './services/console-pane';
import { setupPreferences } from './services/preferences';
import { goToDefaultDirectory } from './services/file-nav';
import { setupWindows, calibratePanes } from './services/sizing';
import { initShortcutsDisplay } from './services/shortcuts';
import { addEditor } from './services/editor';
import * as store from './services/store';
import $ from 'jquery';
import templates from 'templates';
import guid from './services/guid';

import React from 'react';
import ReactDOM from 'react-dom';
import Main from './containers/main.jsx';

//startPrompt();
//setupPreferences();

// // todo: this should live somewhere else
// (function () {
//   goToDefaultDirectory().catch(function (error) {
//     console.error('main::goToDefaultDirectory', error);
//   });
// }());

// (function () {
//   let pythonPaths = store.get('pythonPaths'),
//     pythonCmd = store.get('pythonCmd');
//
//   pythonPaths = pythonPaths || [];
//   if (pythonCmd && pythonPaths.indexOf(pythonCmd) < 0) {
//     pythonPaths.push(pythonCmd);
//   }
//   pythonPaths.forEach(function (pythonPath) {
//     $('#python-paths').append(templates['python-path-item'](pythonPath));
//   });
// }());

// // misc startup stuff...
// $('[data-toggle="tooltip"]').tooltip();
//setTimeout(calibratePanes, 650);
//setupWindows();
//initShortcutsDisplay();

// (function () {
//   $(document).ready(function () {
//
//     if (/win32/i.test(navigator.platform)) {
//       $('#new-python-path').attr('placeholder', 'i.e. C:\\Users\\hmardukas\\Anaconda3\\envs\\py27\\python.exe');
//     } else {
//       $('#new-python-path').attr('placeholder', 'i.e. /Users/hmardukas/anaconda/envs/py27/bin/python');
//     }
//
//     // let's get things going...
//     setTimeout(function () {
//       $('#add-tab').click();
//     }, 450);
//   });
// }());

// (function () {
//   let userId = store.get('userId'),
//     pythonOptions = store.get('pythonOptions') || {},
//     checkPython = pythonOptions.checkPython || {};
//
//   if (!userId) {
//     userId = guid();
//     store.set('userId', userId);
//   }
//
//   window.Intercom('boot', {
//     app_id: 'x8kexgni',
//     user_id: userId,
//     created_at: Date.now()
//   });
//   window.Intercom('update',{
//     pythonCmd: pythonOptions.cmd || '',
//     version: checkPython.version || ''
//   });
// }());

// (function () {
//   $('#add-tab').click(function (e) {
//     e.preventDefault();
//     addEditor();
//     return false;
//   });
// }());

ReactDOM.render(React.createElement(Main, null), document.querySelector('main'));