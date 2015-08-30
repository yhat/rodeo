var path = require('path');
var fs = require('fs');
var rodeorc = path.join(USER_HOME, ".rodeorc");


function updateRC(key, value) {
  var rc;
  if (fs.existsSync(rodeorc)) {
    rc = JSON.parse(fs.readFileSync(rodeorc).toString());
  } else {
    rc = {};
  }
  rc[key] = value;
  fs.writeFileSync(rodeorc, JSON.stringify(rc, null, 2));
}

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

// on startup, set defaults for non-editor preferences
if (fs.existsSync(rodeorc)) {
  var rc = JSON.parse(fs.readFileSync(rodeorc).toString());
  if (rc.defaultWd && fs.existsSync(rc.defaultWd)) {
    setFiles(rc.defaultWd);
  } else {
    setFiles(USER_HOME);
  }
  if (rc.theme) {
    setTheme(rc.theme);
  }
} else {
  setFiles(USER_HOME);
}
