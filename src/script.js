global.$ = $;

var remote = require('remote');
var Menu = remote.require('menu');
var BrowserWindow = remote.require('browser-window');
var MenuItem = remote.require('menu-item');
var shell = require('shell');
var ipc = require('ipc');
var path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var walk = require('walk');
var tmp = require('tmp');
var kernel = require(path.join(__dirname, '/../src/kernel'));

// global vars
var USER_WD = USER_HOME;
var variableWindow;

// Python Kernel
var python;
kernel(function(err, python) {
  global.python = python;
  if (err) {
    console.log(err)
    return;
  }
  if (err) {
    var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };
    var badPythonWindow = new BrowserWindow(params);
    badPythonWindow.loadUrl('file://' + __dirname + '/../static/bad-python.html');
    badPythonWindow.webContents.on('did-finish-load', function() {
      badPythonWindow.webContents.send('ping', { pythonCmds: pythonCmds });
    });
    return;
  }
  refreshVariables();
  refreshPackages();
  setFiles(USER_WD);
  // setup default rodeoProfile
  if (fs.existsSync(path.join(USER_HOME, ".rodeoprofile"))) {
    var profile = fs.readFileSync(path.join(USER_HOME, ".rodeoprofile")).toString();
    sendCommand(profile, false)
  }
});

ipc.on('set-wd', function(wd) {
  USER_WD = wd || USER_WD;
  setFiles(USER_WD);
});

ipc.on('start-tour', function(data) {
  if (data.version=="first") {
    var intro = introJs();
    intro.onbeforechange(function(element) {
      switch(element.id) {
        case "#plot-window": $('a[href="#plot-window"]').click();
      }
    });
    intro.setOptions({
      tooltipPosition: 'auto',
      positionPrecedence: ['left', 'right', 'bottom', 'top'],
      steps: [
        {
          element: "#console",
          intro: "This is a <b>bold</b> tooltip."
        },
        {
          element: "#files",
          intro: "This is another <b>bold</b> tooltip."
        },
        {
          element: "#plot-window",
          intro: "Your plots will show up here."
        },
      ]
    });
    intro.start();
  }
});


function refreshVariables() {
  python.execute("__get_variables()", false, function(result) {
    if (! result.output) {
      $("#vars").children().remove();
      console.error("[ERROR]: Result from code execution was null.");
      return;
    }
    var variables = JSON.parse(result.output);
    $("#vars").children().remove();
    var variableTypes = ["list", "dict", "ndarray", "DataFrame", "Series"];
    variableTypes.forEach(function(type) {
      variables[type].forEach(function(v) {
        $("#vars").append(active_variables_row_template({
            name: v.name, type: type, repr: v.repr
          })
        );
      }.bind(this));
    });
    // configure column widths
    $("#vars tr").first().children().each(function(i, el) {
      $($("#vars-header th")[i]).css("width", $(el).css("width"));
    });
  });
}


function refreshPackages() {
  python.execute("__get_packages()", false, function(result) {
    var packages = JSON.parse(result.output);
    $("#packages-rows").children().remove();
    packages.forEach(function(p) {
      $("#packages-rows").append(
        package_row_template({ name: p.name, version: p.version})
      );
    });
  })
}

function isCodeFinished(code, fn) {
  var code = "__is_code_finished('''" + code + "''')";
  python.execute(code, false, function(result) {
    fn(null, result.output=="True");
  })
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
  } else if (input=="reset" || input=="%%reset" || input=="%reset" || input=="quit" || input=="quit()" || input=="exit" || input=="exit()") {
    ipc.send('quit');
    return;
  }
  var html = history_row_template({ n: $("#history-trail").children().length, command: input });
  $("#history-trail").append(html);
  // auto scroll down
  $cont = $("#history-trail").parent();
  $cont[0].scrollTop = $cont[0].scrollHeight;

  python.execute(input, false, function(result) {
    if (/^help[(]/.test(input)) {
      $("#help-content").text(result.output);
      $('a[href="#help"]').tab("show");
      return;
    } else {
      if (hideResult==true) {
        return;
      }
      // handling png and html, but are there any other types of outputs
      if (result.image) {
        var plotImage = "data:image/png;charset=utf-8;base64," + result.image;
        $("#plots-minimap .active").removeClass("active");
        $("#plots .active").removeClass("active").addClass("hide");
        var newplot = $.parseHTML('<img class="active" style="max-height: 100%; max-width: 100%;" />');
        var plotid = uuid.v4().toString();
        $(newplot).attr("data-plot-id", plotid);
        $(newplot).attr("src", plotImage);
        $(newplot).attr("onclick", "activatePlot($(this).data('plot-id'));")
        // TODO: maybe if minimap is getting too long we can trim it
        $("#plots").append($(newplot).clone());
        // TODO: maybe if minimap is getting too long we can trim it
        $("#plots-minimap").prepend($(newplot).clone());
        $('a[href="#plot-window"]').tab("show");
        calibratePanes();
      } else if (result.html) {
        $("#plots .active").removeClass("active").addClass("hide");
        // var html = $(result.html, "svg").attr("width", "100%").attr("height", "100%").html();
        // TODO: need to handle the sizing here
        result.html = result.html.replace(/600px/g, "95%");
        // result.html = $("svg", result.html).outerHTML();
        $("#plots").append('<div class="active">' + result.html + "</div>");
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
  });
}

// New Windows
function showAbout() {
  var params = {toolbar: false, resizable: false, show: true, height: 200, width: 300 };
  var aboutWindow = new BrowserWindow(params);
  aboutWindow.loadUrl('file://' + __dirname + '/../static/about.html');
}

function popOutConsole() {
  $('#left-column .hsplitter').css('top', $('#left-column').height()-7);
  calibratePanes();
  var params = {toolbar: false, resizable: true, show: true, height: 800, width: 500 };
  var consoleWindow = new BrowserWindow(params);
  consoleWindow.loadUrl('file://' + __dirname + '/../static/about.html');
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
  var params = { toolbar: false, resizable: true, show: true, height: 800, width: 1000 };

  variableWindow = new BrowserWindow(params);
  variableWindow.loadUrl('file://' + __dirname + '/../static/display-variable.html');
  // variableWindow.openDevTools();

  var show_var_statements = {
    DataFrame: "print(" + varname + "[:1000].to_html())",
    Series: "print(" + varname + "[:1000].to_frame().to_html())",
    list: "pp.pprint(" + varname + ")",
    ndarray: "pp.pprint(" + varname + ")",
    dict: "pp.pprint(" + varname + ")"
  }
  variableWindow.webContents.on('did-finish-load', function() {
    python.execute(show_var_statements[type], false, function(result) {
      variableWindow.webContents.send('ping', { type: type, html: result.output });
    });
  });

  variableWindow.on('close', function() {
    variableWindow = null;
  });
}

// End New Windows

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

var walker;
function setFiles(dir) {
  dir = path.resolve(dir)
  if (python==null) {
    return;
  }
  dir = dir || USER_WD;
  USER_WD = dir;
  // set ipython working directory
  python.execute("cd " + dir, false, function(result) {
    // do nothing
  });

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
