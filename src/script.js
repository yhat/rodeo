global.$ = $;

var remote = require('remote');
var Menu = remote.require('menu');
var BrowserWindow = remote.require('browser-window');
var MenuItem = remote.require('menu-item');
var shell = require('shell');
var ipc = require('ipc');
var path = require('path');
var colors = require('colors');
var fs = require('fs');
var fse = require('fs-extra');
var uuid = require('uuid');
var walk = require('walk');
var tmp = require('tmp');
var SteveIrwin = require(path.join(__dirname, '/../src/steve-irwin'));

// global vars
var USER_WD = USER_HOME;
var variableWindow;

// Python Kernel
var spawn = require('child_process').spawn;
var StreamSplitter = require("stream-splitter");
var delim = "\n";
global.callbacks = {};

// we need to actually write the python kernel to a tmp file. this is so python
// can run as a "real" file and not an asar file
var pythonKernel = path.join(__dirname, "../src", "kernel.py");
var kernelFile = tmp.fileSync();
fse.copySync(pythonKernel, kernelFile.name);
// make executable
fs.chmodSync(kernelFile.name, 0755);
// config file to store ipython session details
var configFile = tmp.fileSync();

var python;
SteveIrwin.findMeAPython(function(err, pythonCmd) {
  if (pythonCmd==null || err) {
    var params = {toolbar: false, resizable: true, show: true, height: 800, width: 1000};
    var badPythonWindow = new BrowserWindow(params);
    badPythonWindow.loadUrl('file://' + __dirname + '/../static/bad-python.html');
    badPythonWindow.webContents.on('did-finish-load', function() {
      badPythonWindow.webContents.send('ping', { pythonCmds: pythonCmds });
    });
    return;
  }

  python = spawn(pythonCmd, [kernelFile.name, configFile.name + ".json", delim]);

  // we'll print any feedback from the kernel as yellow text
  python.stderr.on("data", function(data) {
  // process.stderr.write(data.toString().yellow);
    console.log(data.toString().yellow);
  });

  python.on("error", function(err) {
    console.log(err.toString());
  });

  python.on("exit", function(code) {
    fs.unlink(kernelFile.name, function(err) {
      if (err) {
        console.log("failed to remove temporary kernel file: " + err);
      }
    });
    console.log("exited with code: " + code);
  });

  python.on("close", function(code) {
    console.log("closed with code: " + code);
  });

  python.on("disconnect", function() {
    console.log("disconnected");
  });

  // StreamSplitter looks at the incoming stream from kernel.py (which is line
  // delimited JSON) and splits on \n automatically, so we're just left with the
  // JSON data
  python.stdout.pipe(StreamSplitter(delim))
    .on("token", function(data) {
      var result = JSON.parse(data.toString());
      if (result.id in callbacks) {
        callbacks[result.id](result);
        delete callbacks[result.id];
      } else {
        console.log("[ERROR]: " + "callback not found for: " + result.id + " --> " + JSON.stringify(result));
      }
    });

  refreshVariables();
  refreshPackages();
  setFiles(USER_WD);
});


function refreshVariables() {
  var payload = { id: uuid.v4(), code: "__get_variables()" }
  callbacks[payload.id] = function(result) {
    if (! result.output) {
      $("#vars").children().remove();
      console.error("[ERROR]: Result from code execution was null.");
      return;
    }
    var variables = JSON.parse(result.output);
    $("#vars").children().remove();
    variables.forEach(function(v) {
      $("#vars").append(active_variables_row_template({
          name: v.name, type: v.dtype
        })
      );
    }.bind(this));
    // configure column widths
    $("#vars tr").first().children().each(function(i, el) {
      $($("#vars-header th")[i]).css("width", $(el).css("width"));
    });

  }
  python.stdin.write(JSON.stringify(payload) + delim);
}


function refreshPackages() {
  var payload = { id: uuid.v4(), code: "__get_packages()" }
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

function sendCommand(input, hideResult) {
  track('command', 'python');
  if (python==null) {
    jqconsole.Write('Could not execute command. Python is still starting up. This should only take another couple seconds.\n',
                    'jqconsole-error');
    return;
  }
  if (/^\?/.test(input)) {
    input = "help(" + input.slice(1) + ")"
  } else if (input=="quit" || input=="quit()" || input=="exit" || input=="exit()") {
    ipc.send('quit');
    return;
  }
  var html = history_row_template({ n: $("#history-trail").children().length, command: input });
  $("#history-trail").append(html);
  // auto scroll down
  $cont = $("#history-trail").parent();
  $cont[0].scrollTop = $cont[0].scrollHeight;

  var payload = { id: uuid.v4(), code: input }
  callbacks[payload.id] = function(result) {
    if (/^help[(]/.test(input)) {
      $("#help-content").text(result.output);
      $('a[href="#help"]').tab("show");
      return;
    } else {
      if (hideResult==true) {
        return;
      }

      if (result.image) {
        var plotImage = "data:image/png;charset=utf-8;base64," + result.image;
        $("#plots .active").removeClass("active").addClass("hide");
        $("#plots").append('<img class="active" style="max-height: 100%; max-width: 100%;" src="' + plotImage + '" />');
        $('a[href="#plot-window"]').tab("show");
        calibratePanes();
      }

      jqconsole.Write((result.output || "") + "\n");
    }
    if (result.error) {
      track('command', 'error');
      jqconsole.Write(result.error + '\n', 'jqconsole-error');
    }
    refreshVariables();
  }
  python.stdin.write(JSON.stringify(payload) + delim);
}


function showAbout() {
  var params = {toolbar: false, resizable: false, show: true, height: 200, width: 300 };
  var aboutWindow = new BrowserWindow(params);
  aboutWindow.loadUrl('file://' + __dirname + '/../static/about.html');
}

function showPreferences() {
  var rc = getRC();
  rc.keyBindings = rc.keyBindings || "default";
  rc.defaultWd = rc.defaultWd || USER_HOME;
  rc.trackingOn = rc.trackingOn || true;
  if ($("#editor-tab-preferences").length) {
    $("#editor-tab-" + "preferences" + " .editor-tab-a").click();
    return;
  }
  $("#editor-tab-" + "preferences" + " .editor-tab-a").click();
  var editor_tab_html = editor_tab_template({ n: "preferences", name: "Preferences" });
  var preferences_html = preferences_template(rc);

  $(editor_tab_html).insertBefore($("#add-tab").parent());
  $("#editors").append(preferences_html);
  $("#editor-tab-" + "preferences" + " .editor-tab-a").click();
  // initialize all of our tooltips
  $('[data-toggle="tooltip"]').tooltip();
}

function showVariable(varname, type) {
  var params = {toolbar: false, resizable: true, show: true, height: 800, width: 1000};

  variableWindow = new BrowserWindow(params);
  variableWindow.loadUrl('file://' + __dirname + '/../static/display-variable.html');
  // variableWindow.openDevTools();

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

  variableWindow.on('close', function() {
    variableWindow = null;
  });
}

function showPlot() {
  if (! $("img.active").length) {
    return;
  }
  var filename = $("img.active").attr("src");
  var params = {toolbar: false, resizable: false, show: true, height: 1000, width: 1000};
  var plotWindow = new BrowserWindow(params);
  plotWindow.loadUrl(filename);
}

function savePlot() {
  if (! $("img.active").length) {
    return;
  }
  remote.require('dialog').showSaveDialog({
    title:'Export Plot',
    default_path: USER_WD,
  }, function(destfile) {
    if (! destfile) {
      return
    }
    // get rid of inline business
    var img = $("img.active").attr("src").replace("data:image/png;charset=utf-8;base64,", "");
    fs.writeFile(destfile, img, 'base64', function(err) {
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
      default_path: USER_WD,
      }, function(destfile) {
        if (! destfile) {
          if (fn) {
            return fn();
          }
          return;
        }
        $("#editorsTab .active a").text(path.basename(destfile));
        $("#editorsTab .active a").attr("data-filename", destfile);
        fs.writeFileSync(destfile, content);
        $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
        setFiles();
        if (fn) {
          fn();
        }
      }
    );
  } else {
    fs.writeFileSync($("#editorsTab .active a").attr("data-filename"), content);
    $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
    setFiles();
    if (fn) {
      fn();
    }
  }
}

function openFile(pathname) {
  // if file is already open, then just switch to it
  if ($("#editorsTab a[data-filename='" + pathname + "']").length) {
    $("#editorsTab a[data-filename='" + pathname + "']").click();
    return;
  } else if (fs.lstatSync(pathname).isDirectory()) {
    var directory = pathname;
    setFiles(pathname);
  } else {
    // then it's a file
    var filename = pathname;
    var basename = path.basename(filename);
    $("#add-tab").click();
    $("#editorsTab li:nth-last-child(2) .name").text(basename);
    $("#editorsTab li:nth-last-child(2) a").attr("data-filename", filename);
    var id = $("#editors .editor").last().attr("id");
    var editor = ace.edit(id);
    fs.readFile(filename, function(err, data) {
      if (err) {
        console.error("[ERROR]: could not open file: " + filename);
        return;
      }
      editor.getSession().setValue(data.toString());
      // [+] tab is always the last tab, so we'll activate the 2nd to last tab
      $("#editorsTab li:nth-last-child(2) a").click();
      // set to not modified -- NOT IDEAL but it works :)
      setTimeout(function() {
        $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
      }, 50);
    });
  }
}


function openDialog() {
  remote.require('dialog').showOpenDialog({
    title: "Open File",
    default_path: USER_WD,
  }, function(files) {
    if (files) {
      files.forEach(function(filename) {
        openFile(filename);
      });
    }
  });
}

var walker;
function setFiles(dir) {
  if (python==null) {
    return;
  }
  dir = dir || USER_WD;
  USER_WD = dir;
  // set ipython working directory
  var payload = {
    id: uuid.v4(),
    code: "cd " + dir
  }
  callbacks[payload.id] = function(result) {
    // do nothing
  }
  python.stdin.write(JSON.stringify(payload) + '\n');

  var files = fs.readdirSync(dir);
  $("#file-list").children().remove();
  $("#working-directory").children().remove();
  $("#working-directory").append(wd_template({
    dir: dir.replace(USER_HOME, "~")
  }));
  $("#file-list").append(file_template({
    isDir: true,
    filename: formatFilename(path.join(dir, '..')),
    basename: '..'
  }));

  var rc = getRC();

  files.forEach(function(f) {
    var filename = formatFilename(path.join(dir, f));
    if (! fs.lstatSync(filename).isDirectory()) {
      return;
    }
    if (rc.displayDotFiles!=true) {
      if (/\/\./.test(dir) || /^\./.test(f)) {
        // essa dotfile so we're going to skip it
        return;
      }
    }
    $("#file-list").append(file_template({
      isDir: fs.lstatSync(filename).isDirectory(),
      filename: filename,
      basename: f
    }));
  }.bind(this));

  files.forEach(function(f) {
    var filename = formatFilename(path.join(dir, f));
    if (fs.lstatSync(filename).isDirectory()) {
      return;
    }
    if (rc.displayDotFiles!=true) {
      if (/\/\./.test(dir) || /^\./.test(f)) {
        // essa dotfile so we're going to skip it
        return;
      }
    }
    $("#file-list").append(file_template({
      isDir: fs.lstatSync(filename).isDirectory(),
      filename: filename,
      basename: f
    }));
  }.bind(this));

  if (walker) {
    walker.pause();
    delete walker;
  }
  // reindex file search
  walker = walk.walk(USER_WD, { followLinks: false });
  $("#file-search-list .list").children().remove();
  walker.on('file', function(root, stat, next) {
    var dir = root.replace(USER_WD, '') || "";
    var displayFilename = path.join(dir, stat.name).replace(/^\//, '');
    if (rc.displayDotFiles!=true) {
      if (/\/\./.test(dir) || /^\./.test(stat.name)) {
        // essa dotfile so we're going to skip it
        return next();
      }
    }
    var fullFilename = formatFilename(path.join(root, stat.name));
    var onclick = '$(\"#file-search-list .selected\").removeClass(\"selected\"); $(this).addClass(\"selected\"); $(\"#file-search-form\").submit();';
    $("#file-search-list .list").append(
      "<li onclick='" + onclick + "' data-filename='" + fullFilename + "'><a class='filename'>" + displayFilename + "</a></li>"
    );
    next();
  });
  walker.on('end', function() {
    indexFiles();
  });
}

function pickDirectory(title, defaultPath, fn) {
  remote.require('dialog').showOpenDialog({
    title: title,
    properties: ['openDirectory'],
    defaultPath: defaultPath
  }, function(dir) {
    fn(dir);
  });
}

function pickWorkingDirectory(fn) {
  pickDirectory('Select a Working Directory', USER_WD, function(wd) {
    if (! wd) {
      return;
    }
    var wd = wd[0];
    setFiles(wd);
  });
}

function addFolderToWorkingDirectory(newdir) {
  var dirpath = path.join(USER_WD, newdir);
  fs.mkdir(dirpath, function(err) {
    if (err) {
      console.error("[ERROR]: could not create directory: " + dirpath);
    } else {
      setFiles(USER_WD);
    }
  });
}

function setConsoleWidth(w) {
  var code = "pd.set_option('display.width', " + w + ")";
  sendCommand(code, true);
}

function findFile() {
  $("#file-search-modal").unbind();
  $("#file-search-modal").modal("show");
  $("#file-search-modal input").focus();
  $("#file-search-modal").keydown(function(e){
    var selectedFile = $("#file-search-list .list .selected").data("filename");
    if (! fileList) {
      return;
    }
    var nextFile;
    if (e.which==40) {
      // down
      for(var i=0; i<fileList.matchingItems.length-1; i++) {
        if ($(fileList.matchingItems[i].elm).data("filename")==selectedFile) {
          nextFile = $(fileList.matchingItems[i+1].elm).data("filename");
          break;
        }
      }
      if (! nextFile) {
        nextFile = $(fileList.matchingItems[0].elm).data("filename");
      }
    } else if (e.which==38) {
      // up
      for(var i=fileList.matchingItems.length-1; i>0; i--) {
        if ($(fileList.matchingItems[i].elm).data("filename")==selectedFile) {
          nextFile = $(fileList.matchingItems[i-1].elm).data("filename");
          break;
        }
      }
      if (! nextFile) {
        nextFile = $(fileList.matchingItems[fileList.matchingItems.length-1].elm).data("filename");
      }
    }

    $("#file-search-list .list li").each(function(i, el) {
      if ($(el).data("filename")==nextFile) {
        $("#file-search-list .list .selected").removeClass("selected");
        $(el).addClass("selected");
        // keep selected item in the center
        var $parentDiv = $("#file-search-list ul");
        var $innerListItem = $(el);
        $parentDiv.scrollTop($parentDiv.scrollTop() + $innerListItem.position().top - $parentDiv.height()/1.5 + $innerListItem.height()/3);
      }
    });
  });
}
