var app = require('app');
var autoUpdater = require('auto-updater');
var BrowserWindow = require('browser-window');
var os = require('os');
var fs = require('fs');
var path = require('path');
var http = require('http');
var querystring = require('querystring');
var ipc = require('electron').ipcMain;
var crashReporter = require('electron').crashReporter;

var kernel = require('../rodeo/kernel');
var md = require('../rodeo/md');
var findFile = require('../rodeo/find-file');
var preferences = require('../rodeo/preferences');

global.python = null;
global.USER_HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
global.USER_WD = preferences.getPreferences().defaultWd || USER_HOME;

kernel(function(err, python) {

  global.python = python;
  if (err) {
    console.log("[ERROR]: " + err);
    mainWindow.webContents.send("startup-error", err);
    return;
  }
  if (python==null) {
    console.log("[ERROR]: python came back null");
    mainWindow.webContents.send("startup-error", err);
    return;
  }

  mainWindow.webContents.send('refresh-variables');
  mainWindow.webContents.send('refresh-packages');
  mainWindow.webContents.send('set-working-directory', global.USER_WD || '.');
});

crashReporter.start({
  productName: 'Yhat Dev',
  companyName: 'Yhat',
  submitURL: 'http://rodeo-updates.yhat.com/crash',
  autoSubmit: true
});

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
  mainWindow.loadURL('file://' + __dirname + '/../../static/desktop-index.html');

  mainWindow.openDevTools();
  mainWindow.webContents.on('did-finish-load', function() {

    // mainWindow.webContents.send('log', JSON.stringify(process.argv))
    var wd;
    if (process.argv.length == 5) {
      wd = process.argv[4];
    }
    if (wd) {
      console.log("[INFO]: working directory passed as argument: `" + wd + "`");
      mainWindow.webContents.send('set-wd', wd);
    }
    var rc = preferences.getPreferences();
    if (rc.version==null) {
      mainWindow.webContents.send('start-tour', { version: "first" });
      preferences.setPreferences("version", app.getVersion());
    } else if (rc.version != app.getVersion()) {
      mainWindow.webContents.send('start-tour', { version: app.getVersion() });
      preferences.setPreferences("version", app.getVersion());
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
  ipc.on('preferences-get', function(event, arg) {
    var rc = preferences.getPreferences();
    event.returnValue = rc;
  });

  ipc.on('preferences-post', function(event, data) {
    preferences.setPreferences(data.name, data.value);
    event.returnValue = null;
  });

  ipc.on('command', function(event, data) {
    if (data.stream==true || data.stream=='true') {
      python.executeStream(data.command, data.autocomplete=="true", function(result) {
        result.command = data.command;
        event.sender.send('command', result);
      });
    } else {
      python.execute(data.command, data.autocomplete=="true" || data.autocomplete==true, function(result) {
        result.command = data.command;
        result.status = "complete";
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
    event.returnValue = {
      files: files,
      dir: dirname,
      home: USER_HOME
    };
  });

  ipc.on('wd-get', function(event) {
    event.returnValue = USER_WD;
  });

  ipc.on('wd-post', function(event, wd) {
    USER_WD = wd;
    preferences.setPreferences("defaultWd", wd);
    event.returnValue = USER_WD;
  });

  ipc.on('md', function(event, data) {
    md(data.doc, python, false, function(err, doc) {
      event.returnValue = doc;
    });
  });

  ipc.on('pdf', function(event, data) {
    require('dialog').showSaveDialog({
      title: 'Save Report',
      default_path: USER_WD,
    }, function(destfile) {
      if (! /\.pdf/.test(destfile)) {
        destfile += ".pdf";
      }

      mainWindow.webContents.send('pdf', destfile);
    });
  });

  ipc.on('file-get', function(event, filepath) {
    if (/^~/.test(filepath)) {
      filepath = filepath.replace("~", USER_HOME);
    }
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

  ipc.on('update-and-restart', function() {
    autoUpdater.quitAndInstall();
  });

  // TODO: check for updates (i think i need to codesign?)
  var platform = os.platform() + '_' + os.arch();
  var version = app.getVersion();
  updateUrl = "http://localhost:3000/?" + "platform=" + platform + "&version=" + version;
  updateUrl = "http://rodeo-updates.yhat.com?" + "platform=" + platform + "&version=" + version;

  autoUpdater.on('error', function(err, msg) {
    mainWindow.webContents.send('log', "[ERROR]: " + msg);
  });

  autoUpdater.on('update-available', function(data) {
    mainWindow.webContents.send('log', "UPDATE AVAILABLE");
    mainWindow.webContents.send('log', data);
  });

  autoUpdater.on('update-not-available', function(data) {
    console.log("UPDATE NOT AVAILABLE")
    // mainWindow.webContents.send('log', data);
  });

  autoUpdater.on('update-downloaded', function(evt, releaseNotes, releaseName, releaseDate, udpateURL) {
    mainWindow.webContents.send('log', releaseNotes + '---' + releaseName + '---' + releaseDate + '---' + udpateURL);
    mainWindow.webContents.send('update-ready', { platform: 'osx' });
  });

  setTimeout(function() {
    if (/win32/.test(platform)) {
      http.get(updateUrl, function(res) {
        if (res.statusCode!=204) {
          mainWindow.webContents.send('update-ready', { platform: 'windows' });
        }
      }).on('error', function(err) {
        console.error("[ERROR]: could not check for windows update.");
      });
    } else {
      autoUpdater.setFeedURL(updateUrl);
      autoUpdater.checkForUpdates();
    // mainWindow.webContents.send('log', updateUrl);
    }
  }, 2000);

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
