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
      var code = getCurrentLine(editor);

      python.execute(code, true, function(result) {
        var predictions = result.output.map(function(p) {
          // for(var i=p.text.length; i>0; i--) {
          //   p.value = p.text;
          //   if (code==p.text.slice(0, i) ){
          //     p.value = p.text.slice(i);
          //     break;
          //   }
          // }
          var value = p.text;
          // if it's not a filename and there's a "." in the value, we want
          // to set the value to just the last item in the list
          if (value.indexOf("/")==-1 && value.indexOf(".") > -1) {
            value = value.split(".").slice(value.split(".").length-1).join(".");
          }
          // console.log(code + "|" + p.text + "|" + value);
          return { caption: p.text, value: value, score: 100, meta: null };
        });
        // if (predictions.length==1 && code.indexOf("~") > -1) {
        //   var rng = {
        //     start: {
        //       row:2 ,
        //       column:4
        //     },
        //     end:{
        //       row:2,
        //       column:6
        //     }
        //   };
        //   editor.session.replace(rng, USER_HOME);
        // }
        fn(null, predictions)
      });
    }
  };
  langTools.addCompleter(pythonCompleter);


  // initialize shortcuts

  // TODO: fix this...
  var allCommands = editor.commands.byName;
  editor.commands.bindKey("Cmd-d", null)
  allCommands.findnext.bindKey = {win: "Ctrl-d", mac: "Cmd-d"};
  editor.commands.addCommand(allCommands.findnext)

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
      } else if (! /^ /.test(editor.session.getLine(currentRow))) {
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
