function getCurrentLine(editor) {
  return editor.session.getLine(editor.getCursorPosition().row);
}

function setDefaultPreferences(editor) {
  getRC(function(rc) {
    if (rc.keyBindings=="default") {
      rc.keyBindings = null;
    }
    editor.setKeyboardHandler(rc.keyBindings || null); // null is the "default"
    editor.setTheme(rc.editorTheme || "ace/theme/chrome");
    editor.setFontSize(rc.fontSize || 12);

    if (rc.autoSave) {
      editor.on('input', function() {
        saveEditor();
      });
    }
});
}

function createEditor(id) {

  track('application', 'editor');

  var langTools = ace.require("ace/ext/language_tools");
  // this removes local completer
  langTools.setCompleters([]);

  var Autocomplete = ace.require("ace/autocomplete").Autocomplete;
  var editor = ace.edit(id);
  editor.completer = new Autocomplete(editor);
  editor.setTheme("ace/theme/chrome");
  editor.getSession().setMode("ace/mode/python");
  editor.setOptions({
    useSoftTabs: true,
    showPrintMargin: false,
    enableBasicAutocompletion: true,
    enableSnippets: false,
    enableLiveAutocompletion: false
  });
  editor.$blockScrolling = Infinity;

  // Autocomplete
  var pythonCompleter = {
    getCompletions: function(editor, session, pos, prefix, fn) {
      session.$mode.$keywordList = [];
      // get the current line from the begining of the line to the cursor
      var code = getCurrentLine(editor).slice(0, editor.getCursorPosition().column);

      executeCommand(code, true, function(result) {
        var predictions = result.output.map(function(p) {
          var value = p.text;
          // if it's not a filename and there's a "." in the value, we want
          // to set the value to just the last item in the list
          if (value.indexOf("/")==-1 && value.indexOf(".") > -1) {
            value = value.split(".").slice(value.split(".").length-1).join(".");
          }

          return { caption: p.text, value: value, score: 100, meta: null };
        });

        fn(null, predictions);
      });
    }
  };
  langTools.addCompleter(pythonCompleter);


  // start shortcuts

  // TODO: fix this...
  var allCommands = editor.commands.byName;
  editor.commands.bindKey("Cmd-d", null);
  allCommands.findnext.bindKey = {win: "Ctrl-d", mac: "Cmd-d"};
  editor.commands.addCommand(allCommands.findnext)


  editor.commands.addCommand({
    name: "shift-editor-left",
    bindKey: {win: "ctrl-option-left", mac: "ctrl-option-left"},
    exec: function(editor) {
      track('shortcut', 'Change Editor > Move One Left');
      shiftEditorLeft();
    }
  });

  editor.commands.addCommand({
    name: "shift-editor-right",
    bindKey: {win: "ctrl-option-right", mac: "ctrl-option-right"},
    exec: function(editor) {
      track('shortcut', 'Change Editor > Move One Right');
      shiftEditorRight();
    }
  });

  // override the settings menu
  editor.commands.addCommand({
    name: "showPreferences",
    bindKey: {win: "ctrl-,", mac: "Command-,"},
    exec: function(editor) {
      showPreferences();
    }
  });

  // override cmd+shift+g
  editor.commands.addCommand({
    name: "pickWorkingDirectory",
    bindKey: {win: "ctrl-Shift-g", mac: "Command-Shift-g"},
    exec: function(editor) {
      setWorkingDirectory();
    }
  });

  // override cmt+t
  editor.commands.addCommand({
    name: "findFile",
    bindKey: {win: "ctrl-option-t", mac: "Command-option-t"},
    exec: function(editor) {
      findFile();
    }
  });

  editor.commands.addCommand({
    name: "findFile2",
    bindKey: {win: "ctrl-k", mac: "Command-k"},
    exec: function(editor) {
      findFile();
    }
  });

  // indent selection
  editor.commands.addCommand({
    name: "indentSelection",
    bindKey: {win: "ctrl-\]", mac: "Command-\]"},
    exec: function(editor) {
      if (editor.getSelectedText()) {
        editor.blockIndent(editor.getSelectionRange());
      } else {
        editor.blockIndent(editor.getCursorPosition().row);
      }
    }
  });

  // outdent selection
  editor.commands.addCommand({
    name: "outSelection",
    bindKey: {win: "ctrl-\[", mac: "Command-\["},
    exec: function(editor) {
      if (editor.getSelectedText()) {
        editor.blockOutdent(editor.getSelectionRange());
      } else {
        editor.blockOutdent(editor.getCursorPosition().row);
      }
    }
  });

  editor.commands.addCommand({
    name: "sendCommand",
    bindKey: {win: "ctrl-Enter", mac: "Command-Enter"},
    exec: function(editor) {
      // grab selected text
      var text = editor.getCopyText();

      // get the current line number and the next line number
      var currentRow = editor.getSelectionRange().end.row;
      var nextRow = currentRow + 1;

      // if they don't have anything highlighted (i.e. going 1 line at a time), then
      //  we need to be a little tricky
      if (text=="") {
        text = editor.session.getLine(currentRow);
      }
      text = jqconsole.GetPromptText() + text;

      var isFinished = false;
      if (nextRow==editor.session.getLength()) {
        // we're done. send the code
        isFinished = true;
      } else if (editor.session.getLine(nextRow)=="") {
        // we're done. send the code
        isFinished = true;
      } else if (/return/.test(editor.session.getLine(currentRow))) {
        // we're done. send the code
        isFinished = true;
      } else if (! /^ /.test(editor.session.getLine(nextRow))) {
        isFinished = true;
      } else {
        // well then we're still going...
      }

      if (isFinished) {
        jqconsole.SetPromptText(text);
        jqconsole.Write(jqconsole.GetPromptText(true) + '\n');
        jqconsole.ClearPromptText();
        jqconsole.SetHistory(jqconsole.GetHistory().concat([text]));
        sendCommand(text);
        // this seems to behave better without the scroll getting in th way...
        // editor.scrollToLine(currentRow + 1, true, true, function () {});
      } else {
        text = text + '\n';
        jqconsole.ClearPromptText();
        jqconsole.SetPromptText(text);
      }
      if (nextRow==editor.session.getLength()) {
        editor.session.setValue(editor.session.getValue() + "\n")
      }
      editor.gotoLine(currentRow + 2, 10, true);
    }
  });

  editor.commands.addCommand({
    name: "saveFile",
    bindKey: {win: "ctrl-s", mac: "Command-s"},
    exec: function(editor) {
      saveEditor(editor);
    }
  });

  editor.commands.addCommand({
    name: "cancelInput",
    bindKey: {win: "ctrl-c", mac: "ctrl-c"},
    exec: function(editor) {
      jqconsole.SetPromptText('');
    }
  });

  editor.commands.addCommand({
    name: "autocomplete",
    bindKey: {win: "Tab", mac: "Tab"},
    exec: function(editor) {
      var pos = editor.getCursorPosition();
      var text = editor.session.getTextRange({
        start: { row: pos.row, column: pos.column - 1 },
        end: { row: pos.row, column: pos.column }
      });

      var line = getCurrentLine(editor);

      // Don't ask about the setTimeout-50 business. This bug came out of nowhere.
      // Everything was workign fine without it and then all of a sudden it popped
      // up. I'm not even sure how I thought that this might fix it. It was a
      // total shot in the dark. Million to one shot doc, million to one.
      if (/from /.test(line) || /import /.test(line)) {
        setTimeout(function() {
          editor.completer.showPopup(editor);
        }, 50);
      } else if (text!=" " && text!="") {
        setTimeout(function() {
          editor.completer.showPopup(editor);
        }, 50);
      } else {
        editor.insert("    ");
      }
    }
  });
  // generic shortcuts
  // Focus
  editor.commands.addCommand({
    name: "focus-2",
    bindKey: {win: "ctrl-2", mac: "Command-2"},
    exec: function(editor) {
      focusOnConsole();
    }
  });
  editor.commands.addCommand({
    name: "focus-3",
    bindKey: {win: "ctrl-3", mac: "Command-3"},
    exec: function(editor) {
      focusOnTopRight();
    }
  });
  editor.commands.addCommand({
    name: "focus-4",
    bindKey: {win: "ctrl-4", mac: "Command-4"},
    exec: function(editor) {
      focusOnBottomRight();
    }
  });
  // Run previous
  editor.commands.addCommand({
    name: "runLastCommand",
    bindKey: {win: "ctrl-shift-1", mac: "Command-shift-1"},
    exec: function(editor) {
      runLastCommand();
    }
  });
  editor.commands.addCommand({
    name: "run2ndToLastCommand",
    bindKey: {win: "ctrl-shift-2", mac: "Command-shift-2"},
    exec: function(editor) {
      run2ndToLastCommand();
    }
  });
  // new file
  editor.commands.addCommand({
    name: "newFile",
    bindKey: {win: "ctrl-option-shift-n", mac: "ctrl-option-shift-n"},
    exec: function(editor) {
      $("#add-tab").click();
    }
  });

  if (! isDesktop()) {
    editor.commands.addCommand({
      name: "openUserFile",
      bindKey: {win: "ctrl-o", mac: "command-o"},
      exec: function(editor) {
        $('#file-upload-trigger').click();
      }
    });
    editor.commands.addCommand({
      name: "closeOpenFile",
      bindKey: {win: "ctrl-option-shift-w", mac: "command-option-shift-w"},
      exec: function(editor) {
        var n = $("#editorsTab .active").attr("id").replace("editor-tab-", "");
        closeActiveTab(n);
        getActiveEditor().focus();
      }
    });
    editor.commands.addCommand({
      name: "closeOpenFile2",
      bindKey: {win: "ctrl-b", mac: "command-b"},
      exec: function(editor) {
        var n = $("#editorsTab .active").attr("id").replace("editor-tab-", "");
        closeActiveTab(n);
        getActiveEditor().focus();
      }
    });
  }

  // end shortcuts

  editor.on('input', function() {
    $("#" + id.replace("editor", "editor-tab") + " .unsaved").removeClass("hide");
  });

  setDefaultPreferences(editor);
}

function saveFile(filepath, content, fn) {
  var payload = { "filepath": filepath, "content": content };
  if (isDesktop()) {
    var data = ipc.sendSync('file-post', payload);
    fn(data);
  } else {
    $.post('file', payload, function(resp) {
      fn(resp);
    });
  }
}


function closeActiveTab(n) {
  if (! $("#editor-tab-" + n + " .unsaved").hasClass("hide")) {
    bootbox.dialog({
      title: "Do you want to save the changes you've made to this file?",
      message: "Your changes will be discarded otherwise.",
      buttons: {
        cancel: {
          label: "Cancel",
          className: "btn-default",
          callback: function() {
            return;
          }
        },
        dontSave: {
          label: "Don't Save",
          className: "btn-default",
            callback: function() {
              $("#editorsTab .editor-tab-a").first().click();
              $("#editor-tab-" + n).remove();
              $("#editor-tab-pane-" + n).remove();
            }
        },
        save: {
          label: "Save",
          className: "btn-primary",
          callback: function() {
            saveEditor(ace.edit("editor-" + n), null, function() {
              $("#editorsTab .editor-tab-a").first().click();
              $("#editor-tab-" + n).remove();
              $("#editor-tab-pane-" + n).remove();
            });
          }
        }
      }
    });
  } else {
    var prevTab = $("#editor-tab-" + n).prev();
    $("#editor-tab-" + n).remove();
    $("#editor-tab-pane-" + n).remove();
    if (prevTab && $("a", prevTab).attr("href")!="#") {
      $("a", prevTab).click();
    }
  }
}

function newEditor(basename, fullpath, content) {
  $("#add-tab").click();
  $("#editorsTab li:nth-last-child(2) .name").text(basename);
  $("#editorsTab li:nth-last-child(2) a").attr("data-filename", fullpath);
  var id = $("#editors .editor").last().attr("id");
  var editor = ace.edit(id);
  editor.getSession().setValue(content);
  return editor;
}

function openFile(pathname, isDir) {
  // if file is already open, then just switch to it
  if ($("#editorsTab a[data-filename='" + pathname + "']").length) {
    $("#editorsTab a[data-filename='" + pathname + "']").click();
    return;
  } else if (isDir) {
    var directory = pathname;
    setFiles(pathname);
  } else {
    function callback(basename, pathname, content) {
      newEditor(basename, pathname, content)
      // [+] tab is always the last tab, so we'll activate the 2nd to last tab
      $("#editorsTab li:nth-last-child(2) a").click();
      var id = $("#editors .editor").last().attr("id");
      // set to not modified -- NOT IDEAL but it works :)
      setTimeout(function() {
        $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
      }, 50);
    }
    if (isDesktop()) {
      var data = ipc.sendSync('file-get', pathname);
      callback(data.basename, pathname, data.content);
    } else {
      $.get("file", { filepath: pathname }, function(resp) {
        callback(resp.basename, pathname, resp.content);
      });
    }
  }
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
    if (isDesktop()) {
      // TODO: prompt w/ showFileDialog...
    } else {
      bootbox.prompt("Please specify a name for your file:", function(destfile) {
        if (destfile==null) {
          return;
        }
        $("#editorsTab .active a .name").text(destfile);
        $("#editorsTab .active a").attr("data-filename", destfile);
        saveFile(destfile, content, function(resp) {
          $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
          setFiles();
          if (fn) {
            fn();
          }
        });
      });
    }
  } else {
    saveFile($("#editorsTab .active a").attr("data-filename"), content, function(resp) {
      $("#" + id.replace("editor", "editor-tab") + " .unsaved").addClass("hide");
      setFiles();
      if (fn) {
        fn();
      }
    });
  }
}

function saveActiveEditor(saveas) {
  saveas = saveas || false
  var editor = getActiveEditor();
  saveEditor(editor, saveas);
}

function closeActiveFile() {
  if ($("#editorsTab .active").length) {
    var n = $("#editorsTab .active").attr("id").replace("editor-tab-", "");
    closeActiveTab(n);
  }
}

function shiftEditorLeft() {
  var prevTab = $("#editorsTab .active").prev();
  if (prevTab && $("a", prevTab).attr("href")!="#") {
    $("a", prevTab).click();
  } else {
    prevTab = $("#editorsTab li").last().prev();
    $("a", prevTab).click()
  }
  var id = $(prevTab).attr("id").replace("tab-", "");
  ace.edit(id).focus();
}

function shiftEditorRight() {
  var nextTab = $("#editorsTab .active").next();
  if (nextTab && $("a", nextTab).attr("href")!="#") {
    $("a", nextTab).click();
  } else {
    nextTab = $("#editorsTab li").first().next();
    $("a", nextTab).click();
  }
  var id = $(nextTab).attr("id").replace("tab-", "");
  ace.edit(id).focus();
}

function getActiveEditor() {
  var id = $("#editors .active .editor").attr("id");
  return ace.edit(id);
}
