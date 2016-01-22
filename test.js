var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc = require('electron').ipcMain;

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/static/startup.html');
  // mainWindow.openDevTools();

  var result = {
    python: true,
    jupyter: true
  };

  ipc.on('exit-tour', function(evt) {
    mainWindow.close();
  });

  ipc.on('test-path', function(evt, pathname) {
    if (result.python==false) {
      result.python = !result.python;
    } else if (result.jupyter==false) {
      result.jupyter = !result.jupyter;
    } else {
      result.python = false;
      result.jupyter = false;
    }
    evt.returnValue = result;
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
