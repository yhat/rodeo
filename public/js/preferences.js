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

function showRodeoProfile() {
  // should do something special here...
  // openFile(path.join(USER_HOME, '.rodeoprofile'));
  $.get("profile", function(profile) {
    newEditor('.rodeoprofile', '~/.rodeoprofile', profile);
  });
}

function configurePreferences(rc) {
  rc.keyBindings = rc.keyBindings || "default";
  rc.defaultWd = rc.defaultWd || USER_HOME;

  if (rc.trackingOn!=false) {
    rc.trackingOn = true;
  }

  var preferences_html = preferences_template(rc);
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
}

// initialize preferences
USER_HOME = null;

function getRC(fn) {
  if (isDesktop()) {
    var rc = ipc.sendSync('preferences');
    fn(rc);
  } else {
    $.get("preferences", function(rc) {
      fn(rc);
    });
  }
}

function setupPreferences() {
  getRC(function(rc) {
    configurePreferences(rc);
  });
}
setupPreferences();
