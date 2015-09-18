var fs = require('fs');

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

function setFontSize(font_size) {
    var font_size_int = parseInt(font_size);
    font_size = Math.min(font_size_int, 22) + "px";
    // set fontSize for both sub-tabs in the preferences tab
    $("#general").css({fontSize: font_size});
    $("#editor").css({fontSize: font_size});
    // set fontSize for console-tab in lower left
    if ($('.jqconsole').length > 1) {
        $('.jqconsole').each(function(i, tab) {
            tab.css({fontSize: font_size});
        });
    }
    else {
        $('.jqconsole').css({fontSize: font_size});
    }

    // set fontSize for each editor
    // i.e. handles top left pane which has multiple tabs
    $(".editor").each(function(i, item) {
        var editor = ace.edit(item.id);
        editor.setFontSize(font_size);
    });
    updateRC("fontSize", font_size_int);
}

function setDefaultWd(wd) {
  updateRC("defaultWd", wd);
}

function setTheme(theme) {
  if (fs.existsSync(path.join(__dirname, "..", "static", theme))) {
    if ($("#rodeo-theme").attr("href")!=theme) {
      $("#rodeo-theme").attr("href", theme);
    }
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

// on startup, set defaults for non-editor preferences
var rc = getRC();
// TODO: would be nice to get rid of the fs check here
if (rc.defaultWd && fs.existsSync(rc.defaultWd)) {
  USER_WD = rc.defaultWd;
} else {
  USER_WD = USER_HOME;
}
if (rc.theme) {
  setTheme(rc.theme);
}
if (rc.fontSize) {
  setTheme(rc.fontSize);
}
