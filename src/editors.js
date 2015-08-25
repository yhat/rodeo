// Editors and tabs
var path = require('path');
var fs = require('fs');

function getLastWord(editor) {
  var pos = editor.getCursorPosition();
  var column = pos.column - 1;
  var wordRange = editor.session.getAWordRange(pos.row, column);
  var text = editor.session.getTextRange(wordRange);

  var newPos = { row: wordRange.start.row, column: wordRange.start.column-1 };
  if (editor.session.getTextRange({start: newPos, end: wordRange.start })==".") {
    var variable = editor.session.getTextRange(editor.session.getAWordRange(newPos.row, newPos.column));
    text = variable + "." + text;
  }
  return text;
}

function setDefaultPreferences(editor) {
  var rodeorc = path.join(USER_HOME, ".rodeorc");
  if (fs.existsSync(rodeorc)) {
    var rc = JSON.parse(fs.readFileSync(rodeorc).toString());
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
}

function createEditor(id) {
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
      var code;
      if (prefix.length==0) {
        code = getLastWord(editor) + ".";
      } else {
        code = getLastWord(editor);
      }
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

  editor.commands.addCommand({
    name: "sendCommand",
    bindKey: {win: "ctrl-Enter", mac: "Command-Enter"},
    exec: function(editor) {
      var text = editor.getCopyText();
      if (text=="") {
        var currline = editor.getSelectionRange().start.row;
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
      if (text!=" " && text!="") {
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
