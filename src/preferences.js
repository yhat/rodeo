var path = require('path');
var fs = require('fs');


function updateRC(key, value) {
  var rodeorc = path.join(USER_HOME, ".rodeorc");
  var rc;
  if (fs.existsSync(rodeorc)) {
    rc = JSON.parse(fs.readFileSync(rodeorc).toString())
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

function setTheme(theme) {
  alert("This feature doesn't work yet, but if it did your Rodeo Theme would be: " + theme);
  updateRC("theme", theme);
}


function setAutoSave(val) {
  updateRC("autoSave", val);
}
