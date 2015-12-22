function setEditorTheme(theme) {
  $(".editor").each(function(i, item) {
    var editor = ace.edit(item.id);
    editor.setTheme(theme);
  });
  updateRC("editorTheme", theme);
}

ace.require("ace/keyboard/vim");
ace.require("ace/keyboard/emacs");

function setKeyBindings(binding) {
  $(".editor").each(function(i, item) {
    var editor = ace.edit(item.id);
    if (binding=="default") {
      binding = null;
    }
    editor.setKeyboardHandler(binding);
  });
  updateRC("keyBindings", binding);
}

function setFontSize(fontSize) {
  var fontSizeInt = parseInt(fontSize);
  fontSize = Math.min(fontSizeInt, 22) + "px";
  $("body").css("font-size", fontSize);
  $("#console pre").css("font-size", fontSize);
  $(".editor").each(function(i, item) {
    var editor = ace.edit(item.id);
    editor.setFontSize(fontSize);
  });
  updateRC("fontSize", fontSizeInt);
}

function setFontType(fontType) {
  $("body").css("font-family", fontType);
  $("#console pre").css("font-family", fontType);
  $(".editor").each(function(i, item) {
    var editor = ace.edit(item.id);
    // TODO: not all fonts are available
    var validFonts = [
      "Consolas",
      "Courier New",
      "Menlo",
      "Monaco"
    ];
    if (validFonts.indexOf(fontType) > -1) {
      editor.setOption("fontFamily", fontType);
    }
  });
  updateRC("fontType", fontType);
}

function setDefaultWd(wd) {
  updateRC("defaultWd", wd);
}

function setTheme(theme) {
  if ($("#rodeo-theme").attr("href")!=theme) {
    $("#rodeo-theme").attr("href", theme);
  }
  updateRC("theme", theme);
}

function setPythonCmd(cmd) {
  if (cmd) {
    cmd = cmd.replace("~", USER_HOME);
    updateRC("pythonCmd", cmd);
  } else {
    updateRC("pythonCmd", null);
  }
}

function setAutoSave(val) {
  updateRC("autoSave", val);
}

function setDisplayDotFiles(val) {
  updateRC("displayDotFiles", val);
}

function setTracking(val) {
  updateRC("trackingOn", val);
}

function saveWindowCalibration() {
  var paneVertical = 100 * $("#pane-container #left-column").width() / $("#pane-container").width();
  var paneHorizontalRight = 100 * $("#pane-container #top-right").height() / $("#pane-container #right-column").height();
  var paneHorizontalLeft = 100 * $("#pane-container #top-left").height() / $("#pane-container #left-column").height();
  updateRC("paneVertical", paneVertical + "%");
  updateRC("paneHorizontalRight", paneHorizontalRight + "%");
  updateRC("paneHorizontalLeft", paneHorizontalLeft + "%");
}

function resetWindowCalibration() {
  bootbox.dialog({
    title: "This will restart your Rodeo session. Are you sure you want to continue?",
    message: "Any unsaved scripts and data will be deleted permanently.",
    buttons: {
      cancel: {
        label: "Cancel",
        className: "btn-default",
        callback: function() {
          return;
        }
      },
      yes: {
        label: "Yes",
        className: "btn-primary",
          callback: function() {
            updateRC("paneVertical", null);
            updateRC("paneHorizontalRight", null);
            updateRC("paneHorizontalLeft", null);
            window.location.reload()
          }
      }
    }
  });
}

function changeDefaultPath(pythonPath) {
  if (pythonPath=="add-path") {
    $('#default-python-modal').modal('show');
  } else {
    setPythonCmd(pythonPath);
    bootbox.dialog({
      title: "Your default Python environment has been updated.",
      message: "For the changes to take affect, you'll need to restart Rodeo. Would you like to do this now?",
      buttons: {
        cancel: {
          label: "No",
          className: "btn-default",
          callback: function() {
            return;
          }
        },
        yes: {
          label: "Yes",
          className: "btn-primary",
            callback: function() {
              require('remote').getCurrentWindow().reload();
            }
        }
      }
    });
  }
}

function showRodeoProfile() {
  // should do something special here...
  if (isDesktop()) {
    var userHome = ipc.sendSync('home-get');
    var profilePath = pathJoin([userHome, ".rodeoprofile"]);
    openFile(profilePath);
  } else {
    $.get("profile", function(profile) {
      newEditor('.rodeoprofile', '~/.rodeoprofile', profile);
    });
  }
}

function configurePreferences(rc) {
  rc.keyBindings = rc.keyBindings || "default";
  rc.defaultWd = rc.defaultWd || USER_HOME;
  rc.fontType = rc.FontType || "Helvetica Neue";
  rc.pythonPaths = rc.pythonPaths || [];
  if (rc.pythonCmd) {
    if (rc.pythonPaths.indexOf(rc.pythonCmd) < 0) {
      rc.pythonPaths.push(rc.pythonCmd);
    }
  }

  if (rc.trackingOn!=false) {
    rc.trackingOn = true;
  }

  var preferences_html = preferences_template(rc);
  $("#preferences").children().remove();
  $("#preferences").append(preferences_html);
  $('[data-toggle="tooltip"]').tooltip();

  // on startup, set defaults for non-editor preferences
  if (rc.defaultWd) { // && fs.existsSync(rc.defaultWd)) {
    USER_WD = rc.defaultWd;
  } else {
    USER_WD = USER_HOME;
  }
  if (rc.theme) {
    setTheme(rc.theme);
  }
  if (rc.fontSize) {
    setFontSize(rc.fontSize);
  }
  if (rc.fontType) {
    setFontType(rc.fontType);
  }
}

$("#add-path-button").click(function(e) {
  var newPath = $("#new-python-path").val();
  var data = ipc.sendSync('test-path', newPath);
  if (data.result && data.result.status) {
    if (data.result.matplotlib && data.result.jupyter) {
      var result = ipc.sendSync('add-python-path', newPath);
      if (result==true) {
        $("#python-paths").append(python_path_item(newPath));

        bootbox.dialog({
          title: "Would you like this to be your default python environment?",
          message: "If you do, Rodeo will restart for the changes to take affect.",
          buttons: {
            cancel: {
              label: "No",
              className: "btn-default",
              callback: function() {
                setupPreferences();
              }
            },
            yes: {
              label: "Yes",
              className: "btn-primary",
                callback: function() {
                  setPythonCmd(newPath);
                  setupPreferences();
                  require('remote').getCurrentWindow().reload();
                }
            }
          }
        });

      } else {
        $("#add-path-help").text("Could not add python path: " + result);
      }
    } else if (! data.result.jupyter) {
      $("#add-path-help").text("The path you specified did not have jupyter installed. Please install jupyter before adding a path.");
    } else if (! data.result.matplotlib) {
      $("#add-path-help").text("The path you specified did not have matplotlib installed. Please install matplotlib efore adding a path.");
    }
  } else {
    $("#add-path-help").text("Invalid Python. Rodeo could not run Python using the path you specified.");
  }
});

function deletePythonPath(el) {
  var pythonPath = $(el).data("path");
  ipc.sendSync('remove-python-path', pythonPath);
  $(el).parent().remove();
  setupPreferences();
}

// initialize preferences
USER_HOME = null;

function getRC(fn) {
  if (isDesktop()) {
    var rc = ipc.sendSync('preferences-get');
    fn(rc);
  } else {
    $.get("preferences", function(rc) {
      fn(rc);
    });
  }
}

function showPreferences() {
  $('a[href^="#preferences"]').click();
}

function setupPreferences() {
  getRC(function(rc) {
    configurePreferences(rc);
  });
}
