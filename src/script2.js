global.$ = $;

var remote = require('remote');
var Menu = remote.require('menu');
var BrowserWindow = remote.require('browser-window');
var MenuItem = remote.require('menu-item');
var shell = require('shell');
var path = require('path');
var colors = require('colors');
var fs = require('fs');
var fse = require('fs-extra');
var uuid = require('uuid');
var tmp = require('tmp');

var abar = require('address_bar');
var folder_view = require('folder_view');
var watch = require("watch");

// watch the plots directory for changes
var plot_dir = path.join(__dirname, "./plots");
watch.createMonitor(plot_dir, function (monitor) {
  monitor.on("created", function (f, stat) {
    var filename = 'file://' + __dirname + '/../static/' + f;
    $("#plots .active").removeClass("active").addClass("hide");
    $("#plots").append('<img class="active" style="max-width: 100%;" src="' + filename + '" />');
    $('a[href="#plot-window"]').tab("show");
  });
});


// Python Kernel
var spawn = require('child_process').spawn;
var delim = "\n";
var callbacks = {};
var pythonKernel = path.join(__dirname, "../src", "kernel.py");
var kernelFile = tmp.fileSync();
fs.writeFileSync(kernelFile.name, fs.readFileSync(pythonKernel).toString());
var python = spawn("python", ["-u", kernelFile.name, delim]);

// we'll print any feedback from the kernel as yellow text
python.stderr.on("data", function(data) {
  console.log(data.toString());
  // process.stderr.write(data.toString().yellow);
});

python.on("error", function(err) {
  console.log(err.toString());
});

python.on("exit", function(code) {
  console.log("exited with code: " + code);
});

python.on("close", function(code) {
  console.log("closed with code: " + code);
});

python.on("disconnect", function() {
  console.log("disconnected");
});

var chunk = "";
python.stdout.on("data", function(data) {
  var chunkette, idx, result, results;
  chunk += data.toString();
  results = [];
  while (chunk.indexOf(delim) > -1) {
    idx = chunk.indexOf(delim);
    chunkette = chunk.slice(0, idx);
    result = JSON.parse(chunkette);

    if (result.id in callbacks) {
      callbacks[result.id](result);
      delete callbacks[result.id];
    }
    chunk = chunk.slice(idx + 1);
  }
});

python.stdin.write(JSON.stringify({ code: ""}) + delim);



function refreshVariables() {
  var payload = { id: uuid.v4(), code: "getvars" }
  callbacks[payload.id] = function(result) {
    var variables = JSON.parse(result.output);
    $("#vars").children().remove();
    variables.forEach(function(v) {
      $("#vars").append(active_variables_row_template({
          name: v.name, type: v.dtype
        })
      );
    });
  }
  python.stdin.write(JSON.stringify(payload) + delim);
}
refreshVariables();


function refreshPackages() {
  var payload = { id: uuid.v4(), code: "packages" }
  callbacks[payload.id] = function(result) {
    var packages = JSON.parse(result.output);
    $("#packages-rows").children().remove();
    packages.forEach(function(p) {
      $("#packages-rows").append(
        package_row_template({ name: p.name, version: p.version})
      );
    });
  }
  python.stdin.write(JSON.stringify(payload) + delim);
}
refreshPackages();


function sendCommand(input) {
  var html = history_row_template({ command: input });
  $("#history-trail").append(html);
  var payload = { id: uuid.v4(), code: input }
  callbacks[payload.id] = function(result) {
    if (/^help[(]/.test(result.code)) {
      $("#help-content").text(result.output);
      $('a[href="#help"]').tab("show");
      return;
    }
    jqconsole.Write(result.output + "\n");
    refreshVariables();
  }
  python.stdin.write(JSON.stringify(payload) + delim);
}


function showAbout(varname) {
  var params = {toolbar: false, resizable: false, show: true, height: 150, width: 400};
  var aboutWindow = new BrowserWindow(params);
  aboutWindow.loadUrl('file://' + __dirname + '/../static/about.html');
}

function showPreferences() {
  var params = {toolbar: false, resizable: true, show: true, height: 800, width: 450};
  var prefsWindow = new BrowserWindow(params);
  prefsWindow.loadUrl('file://' + __dirname + '/../static/preferences.html');
}

function showVariable(varname, type) {
  var params = {toolbar: false, resizable: true, show: true, height: 800, width: 1000};
  var variableWindow = new BrowserWindow(params);
  variableWindow.loadUrl('file://' + __dirname + '/../static/display-variable.html');

  var show_var_statements = {
    DataFrame: "print(" + varname + "[:1000].to_html())",
    list: "pp.pprint(%s)" %  varname
  }

  variableWindow.webContents.on('did-finish-load', function() {
    var payload = {
      id: uuid.v4(),
      code: show_var_statements[type]
    }
    callbacks[payload.id] = function(result) {
      variableWindow.webContents.send('ping', { type: type, html: result.output });
    }
    python.stdin.write(JSON.stringify(payload) + delim);
  });
}

function showPlot() {
  var filename = $("img.active").attr("src");
  var params = {toolbar: false, resizable: false, show: true, height: 1000, width: 1000};
  var plotWindow = new BrowserWindow(params);
  plotWindow.loadUrl(filename);
}

function savePlot() {
  remote.require('dialog').showSaveDialog({
    title:'Export Plot',
    default_path: process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
  }, function(destfile) {
    if (! destfile) {
      return
    }
    // get rid of 'file://'
    var srcfile = $("img.active").attr("src").slice(7);
    fse.copy(srcfile, destfile, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  });
}

function saveEditor(editor, saveas, fn) {
  saveas = saveas || false;
  var id = $($("#editorsTab .active a").attr("href") + " .editor").attr("id");
  if (! editor) {
    editor = ace.edit(id);
  }

  var filename = $("#editorsTab .active a").text();
  var content = editor.getSession().getValue();
  if (! $("#editorsTab .active a").attr("data-filename") || saveas==true) {
    remote.require('dialog').showSaveDialog({
      title: "Save File",
      default_path: process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
      }, function(destfile) {
        if (! destfile) {
          if (fn) {
            return fn();
          }
        }
        $("#editorsTab .active a").text(path.basename(destfile));
        $("#editorsTab .active a").attr("data-filename", destfile);
        fs.writeFileSync(destfile, content);
        $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
        if (fn) {
          fn();
        }
      }
    );
  } else {
    fs.writeFileSync($("#editorsTab .active a").attr("data-filename"), content);
    $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
    if (fn) {
      fn();
    }
  }
}

function openFile(pathname) {
  if (fs.lstatSync(pathname).isDirectory()) {
    var directory = pathname;
    console.log("CWD: " + directory)
    setFiles(pathname);
  } else {
    // then it's a file
    var filename = pathname;
    var basename = path.basename(filename);
    $("#add-tab").click();
    $("#editorsTab li:nth-last-child(2) .name").text(basename);
    $("#editorsTab li:nth-last-child(2) a").attr("data-filename", filename);
    var editor = ace.edit($("#editors .editor").last().attr("id"));
    editor.getSession().setValue(fs.readFileSync(filename).toString());
    $("#editorsTab li:nth-last-child(2) a").click();
  }
}


function openDialog() {
  remote.require('dialog').showOpenDialog({
    title: "Open File",
    default_path: process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
  }, function(files) {
    if (files) {
      files.forEach(function(filename) {
        openFile(filename);
      });
    }
  });
}


function setFiles(dir) {
  var files = fs.readdirSync(dir);
  $("#file-list").children().remove();
  $("#file-list").append(file_template({
    isDir: true,
    filename: path.join(dir, '..'),
    basename: '..'
  }));
  files.forEach(function(f) {
    var filename = path.join(dir, f);
    if (! fs.lstatSync(filename).isDirectory()) {
      return;
    }
    $("#file-list").append(file_template({
      isDir: fs.lstatSync(filename).isDirectory(),
      filename: filename,
      basename: f
    }));
  }.bind(this));

  files.forEach(function(f) {
    var filename = path.join(dir, f);
    if (fs.lstatSync(filename).isDirectory()) {
      return;
    }
    $("#file-list").append(file_template({
      isDir: fs.lstatSync(filename).isDirectory(),
      filename: filename,
      basename: f
    }));
  }.bind(this));
}
setFiles(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);
