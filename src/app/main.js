var app = require('app');
var autoUpdater = require('auto-updater');
var BrowserWindow = require('browser-window');
var os = require('os');
var fs = require('fs');
var path = require('path');
var http = require('http');
var querystring = require('querystring');
var ipc = require('ipc');
var helpers = require('./rodeohelpers');

var kernel = require('../rodeo/kernel');
var findFile = require('../rodeo/find-file');
var preferences = require('../rodeo/preferences');

global.python = null;
global.USER_HOME = process.env.HOME;
global.USER_WD = '/Users/glamp/go/src/github.com/yhat/box/src/sciencebox/langs/tests'; //process.env.HOME;

kernel(function(err, python) {
  global.python = python;
  if (err) {
    console.log("[ERROR]: " + err);
  }
  if (python==null) {
    console.log("[ERROR]: python came back null");
  }

  mainWindow.webContents.send('refresh-variables');
  mainWindow.webContents.send('refresh-packages');
  mainWindow.webContents.send('set-working-directory', global.USER_WD || '.');
});



// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  //   app.quit();
  // }
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  // Create the browser window.
  var atomScreen = require('screen');
  var size = atomScreen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({ width: size.width, height: size.height });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/../../static/desktop-index.html');

  mainWindow.webContents.on('did-finish-load', function() {

    mainWindow.webContents.send('log', JSON.stringify(process.argv))
    var wd;
    if (process.argv.length == 5) {
      wd = process.argv[4];
    }
    if (wd) {
      console.log("[INFO]: working directory passed as argument: `" + wd + "`");
      mainWindow.webContents.send('set-wd', wd);
    }
    var rc = helpers.getRC();
    if (rc.version==null) {
      mainWindow.webContents.send('start-tour', { version: "first" });
      helpers.updateRC("version", app.getVersion());
    } else if (rc.version != app.getVersion()) {
      mainWindow.webContents.send('start-tour', { version: app.getVersion() });
      helpers.updateRC("version", app.getVersion());
    }
  });

  // Open the devtools.
  // mainWindow.openDevTools();

  var internetStatus = 'online';
  ipc.on('online-status-changed', function(evt, status) {
    internetStatus = status;
  });

  ipc.on('quit', function(event) {
    app.quit();
  });

  // server like routes
  ipc.on('preferences', function(event, arg) {
    var rc = preferences.getPreferences();
    event.returnValue = rc;
  });

  ipc.on('command', function(event, data) {
    if (data.stream==true || data.stream=='true') {
      python.executeStream(data.command, data.autocomplete=="true", function(result) {
        result.command = data.command;
        result = JSON.stringify(result);
        event.sender.send('command', result);
      });
    } else {
      python.execute(data.command, data.autocomplete=="true" || data.autocomplete==true, function(result) {
        result.command = data.command;
        result.status = "complete";
        // result = JSON.stringify(result);
        event.returnValue = result;
      });
    }
  });

  ipc.on('index-files', function(event, arg) {
    event.sender.sendJSON = function(data) {
      event.sender.send(data.msg, data);
    }
    findFile(event.sender);
  });

  ipc.on('files', function(event, data) {
    var dirname = path.resolve(data.dir || USER_WD);
    USER_WD = dirname
    var files = fs.readdirSync(dirname).map(function(filename) {
      return {
        filename: path.join(dirname, filename),
        basename: filename,
        isDir: fs.lstatSync(path.join(dirname, filename)).isDirectory()
      }
    });
    event.returnValue = files;
  });

  ipc.on('wd-get', function(event) {
    event.returnValue = USER_WD;
  });

  ipc.on('wd-post', function(event, wd) {
    USER_WD = wd;
    event.returnValue = USER_WD;
  });

  ipc.on('file-get', function(event, filepath) {
    event.returnValue = {
      basename: path.basename(filepath),
      pathname: filepath,
      content: fs.readFileSync(filepath).toString()
    }
  });

  ipc.on('file-post', function(event, data) {
    fs.writeFile(data.filepath, data.content, function(err) {
      event.returnValue = {
        status: "OK",
        filepath: data.filepath,
        basename: path.basename(data.filepath)
      }
    });
  });

  // TODO: check for updates (i think i need to codesign?)
  // var platform = os.platform() + '_' + os.arch();
  // var version = app.getVersion();
  // updateUrl = 'https://rodeo-nuts.herokuapp.com/update/'+platform+'/'+version;
  //
  // autoUpdater.on('error', function(err, msg) {
  //   mainWindow.webContents.send('log', "[ERROR]: " + msg);
  // });
  // mainWindow.webContents.send('log', updateUrl);
  // autoUpdater.setFeedUrl(updateUrl);
  //
  // autoUpdater.on('update-available', function(data) {
  //   mainWindow.webContents.send('log', "UPDATE AVAILABLE");
  //   mainWindow.webContents.send('log', data);
  // });
  // autoUpdater.on('update-not-available', function(data) {
  //   mainWindow.webContents.send('log', "NO UPDATE AVAILABLE");
  //   mainWindow.webContents.send('log', data);
  // });
  //
  // autoUpdater.checkForUpdates();

  mainWindow.on('close', function() {
    mainWindow.webContents.send('kill');
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
