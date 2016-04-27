// TODO: just get this from IPython stderr
var msg = "IPython -- An enhanced Interactive Python.\n"
msg += "?         -> Introduction and overview of IPython's features.\n"
msg += "%quickref -> Quick reference.\n"
msg += "help      -> Python's own help system.\n"
msg += "object?   -> Details about 'object', use 'object??' for extra details.\n"
var jqconsole = $('#console').jqconsole(msg, '>>> ');
function startPrompt() {
  // Start the prompt with history enabled.
  jqconsole.Prompt(true, function (input) {
    sendCommand(input);
    // Restart the prompt.
    startPrompt();
  });
}
// 4 spaces for python
jqconsole.SetIndentWidth(4);

// ctrl + l to clear
jqconsole.RegisterShortcut('l', function () {
  jqconsole.Clear();
});

// ctrl + a to skip to beginning of line
jqconsole.RegisterShortcut('a', function () {
  jqconsole.MoveToStart();
});

// ctrl + e to skip to end of line
jqconsole.RegisterShortcut('e', function () {
  jqconsole.MoveToEnd();
});

// ctrl + c to cancel input
jqconsole.RegisterShortcut('c', function () {
  if (!$("#btn-interrupt").hasClass("hide")) {
    $("#btn-interrupt").click();
  } else {
    jqconsole.ClearPromptText();
  }
});

// ctrl + u to clear to beginning
jqconsole.RegisterShortcut('u', function () {
  var text = jqconsole.GetPromptText().slice(jqconsole.GetColumn() - 4);
  jqconsole.SetPromptText(text);
});

// ctrl + k to clear to end
jqconsole.RegisterShortcut('k', function () {
  var text = jqconsole.GetPromptText().slice(0, jqconsole.GetColumn() - 4);
  jqconsole.SetPromptText(text);
});

// ctrl + w to clear one word backwards
jqconsole.RegisterShortcut('w', function () {
  var idx = jqconsole.GetColumn() - 4;
  var text = jqconsole.GetPromptText().trim();
  var lidx = text.slice(0, idx).lastIndexOf(" ");
  if (lidx == -1) {
    lidx = 0;
  }
  text = text.slice(0, lidx) + " " + text.slice(idx + 1);
  text = text.trim();
  jqconsole.SetPromptText(text);
});

jqconsole.RegisterShortcut('1', function () {
  focusOnEditor();
});

jqconsole.RegisterShortcut('3', function () {
  focusOnTopRight();
});

jqconsole.RegisterShortcut('4', function () {
  focusOnBottomRight();
});

// autocomplete
jqconsole._IndentOld = jqconsole._Indent;
jqconsole._Indent = function () {
  if (jqconsole.GetPromptText().trim() == "") {
    jqconsole._IndentOld();
  } else if (jqconsole.GetPromptText().slice(-1) == "\n") {
    jqconsole._IndentOld();
  } else {
    var originalPrompt = jqconsole.GetPromptText();
    var code = jqconsole.GetPromptText();
    code = code.slice(0, jqconsole.GetColumn() - 4);

    jqconsole.ClearPromptText(true);

    executeCommand(code, true, function (result) {
      if (!result) {
        return;
      }
      var predictions;
      try {
        predictions = JSON.parse(result.output);
      } catch (e) {
        console.log('[ERROR]: ' + e + ' --> ' + result.output);
        return;
      }
      // if only 1 suggestion comes back then we'll take the liberty and finish
      // the autocomplete
      var completedText = "";
      if (predictions.length == 1) {
        var prediction = predictions[0].text;
        originalPrompt = originalPrompt.replace("~", store.get('userHome'));
        completedText = originalPrompt.replace(code, prediction);
        for (var i = prediction.length; i > 0; i--) {
          var p = prediction.slice(0, i);
          if (originalPrompt.slice(-p.length) == p) {
            completedText = originalPrompt + prediction.slice(i);
            break;
          }
        }
        jqconsole.SetPromptText(completedText);
        return;
      }
      // otherwise we need to display potential completions

      // a good ratio for characters:pixels is 1:6.4. we're going to use this
      // to make our ascii table look pretty in the space that we have
      var widthChars = $("#console").width() / 6.4;

      // I tried fiding the longest string and then adding 5 characters, but
      // just using 20 and padding 5 characters seems to be working better...
      var longestString = 20;
      var nCols = Math.round(widthChars / (longestString + 5), 0);

      var table = new AsciiTable();
      var row = [];
      for (var i = 0; i < predictions.length; i++) {
        var text;
        // so apparenlty the predictions sometimes don't come back as { text: "foo"}
        // not sure where/why this would happen but it causes mucho problemos
        if (!predictions[i]) {
          return;
        }
        text = predictions[i].text;
        row.push(text);
        if (row.length == nCols) {
          table.addRow(row);
          row = [];
        }
      }
      if (row.length > 0) {
        table.addRow(row);
      }
      table.removeBorder().setJustify();
      jqconsole.Write(table.render() + '\n\n', 'jqconsole-output');
      startPrompt();
      jqconsole.SetPromptText(originalPrompt)
    });
  }
};

// make the cursor blink when the user is in the console
/*
 var opacity = 0.2;
 function cursorBlink() {
 if (opacity==0.2) {
 opacity = 1;
 } else {
 opacity = 0.2
 }
 $(".jqconsole-cursor").css("opacity", opacity);
 }

 var cursorBlinkId;
 $("#console").focusin(function() {
 cursorBlinkId = setInterval(cursorBlink, 550);
 });

 $("#console").focusout(function() {
 if (cursorBlinkId) {
 clearInterval(cursorBlinkId);
 cursorBlinkId = null;
 }
 });
 */
