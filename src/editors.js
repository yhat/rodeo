// Editors and tabs
var path = require('path');
var fs = require('fs');

function getCurrentLine(editor) {
  return editor.session.getLine(editor.getCursorPosition().row);
}

function setDefaultPreferences(editor) {
  var rc = getRC();
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
}

function createEditor(id) {

  track('application', 'editor');

  var langTools = ace.require("ace/ext/language_tools");
  var Autocomplete = ace.require("ace/autocomplete").Autocomplete;
  var editor = ace.edit(id);
  editor.completer = new Autocomplete(editor);
  editor.setTheme("ace/theme/chrome");
  editor.getSession().setMode("ace/mode/python");
  editor.setOptions({
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
      var code = getCurrentLine(editor);
      var payload = {
        id: uuid.v4(),
        code: code,
        complete: true,
      }

      callbacks[payload.id] = function(result) {
        var predictions = result.output.map(function(p) {
          return { name: p.text, value: p.text, score: 100, meta: p.dtype };
        });
        fn(null, predictions)
      };
      python.stdin.write(JSON.stringify(payload) + "\n");
    }
  };
  langTools.addCompleter(pythonCompleter);


  // initialize shortcuts

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
      pickWorkingDirectory();
    }
  });

  // override cmt+t
  editor.commands.addCommand({
    name: "findFile",
    bindKey: {win: "ctrl-t", mac: "Command-t"},
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
      var text = editor.getCopyText();
      var currline = editor.getSelectionRange().end.row;
      if (text=="") {
        text = editor.session.getLine(currline);
      }
      jqconsole.Write(">>> " + text + '\n', 'jqconsole-old-input');
      jqconsole.SetHistory(jqconsole.GetHistory().concat([text]));
      sendCommand(text);
      // this seems to behave better without the scroll getting in th way...
      // editor.scrollToLine(currline + 1, true, true, function () {});
      editor.gotoLine(currline + 2, 10, true);
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
    name: "autocomplete",
    bindKey: {win: "tab", mac: "tab"},
    exec: function(editor) {
      var pos = editor.getCursorPosition();
      var text = editor.session.getTextRange({
        start: { row: pos.row, column: pos.column - 1 },
        end: { row: pos.row, column: pos.column }
      });

      var line = getCurrentLine(editor);

      if (/from /.test(line) || /import /.test(line)) {
        editor.completer.showPopup(editor)
      } else if (text!=" " && text!="") {
        editor.completer.showPopup(editor)
      } else {
        editor.insert("    ");
      }
    }
  });
  editor.on('input', function() {
    $("#" + id.replace("editor", "editor-tab") + " .unsaved").removeClass("hide");
  });
  setDefaultPreferences(editor);
}
