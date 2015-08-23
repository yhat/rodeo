// Editors and tabs

function createEditor(id) {
  var langTools = ace.require("ace/ext/language_tools");
  var Autocomplete = ace.require("ace/autocomplete").Autocomplete;
  var editor = ace.edit(id);
  editor.setTheme("ace/theme/chrome");
  editor.getSession().setMode("ace/mode/python");
  // editor.getSession().setValue("import toyplot\nimport numpy as np\nx = numpy.linspace(0, 10)\ny = x ** 2\ncanvas = toyplot.Canvas(width=300, height=300)\naxes = canvas.axes()\nmark = axes.plot(x, y)")
  editor.setOptions({
    showPrintMargin: false,
    enableBasicAutocompletion: true,
    enableSnippets: false,
    enableLiveAutocompletion: false
  });
  editor.$blockScrolling = Infinity;
  // initialize shortcuts
  editor.commands.addCommand({
    name: "sendCommand",
    bindKey: {win: "ctrl-Enter", mac: "Command-Enter"},
    exec: function(editor) {
      var text = editor.getCopyText();
      if (text=="") {
        var currline = editor.getSelectionRange().start.row;
        text = editor.session.getLine(currline);
      }
      jqconsole.Write(">>> " + text + '\n', 'jqconsole-input');
      sendCommand(text);
      editor.scrollToLine(currline + 1, true, true, function () {});
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
      console.log("theoretically autocompleting");
      // var pos = editor.getCursorPosition();
      // var text = editor.session.getTextRange({
      //   start: { row: pos.row, column: pos.column - 1 },
      //   end: { row: pos.row, column: pos.column }
      // });
      // if (text!=" " && text!="") {
      //   editor.completer.showPopup(editor)
      // } else {
      //   editor.insert("    ");
      // }
    }
  });
  editor.on('input', function() {
    $("#" + id.replace("editor", "editor-tab") + " .unsaved").removeClass("hide");
  });
}
