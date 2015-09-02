var path = require('path');
var fs = require('fs');

function setEditorTheme(theme) {
  $(".editor").each(function(i, item) {
    var editor = ace.edit(item.id);
    editor.setTheme(theme);
  });
  updateRC("editorTheme", theme);
}

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

function setFontSize(size) {
  size = parseInt(size);
  $(".editor").each(function(i, item) {
    var editor = ace.edit(item.id);
    editor.setFontSize(size);
  });
  updateRC("fontSize", size);
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
if (rc.defaultWd && fs.existsSync(rc.defaultWd)) {
  USER_WD = rc.defaultWd;
} else {
  USER_WD = USER_HOME;
}
if (rc.theme) {
  setTheme(rc.theme);
}
