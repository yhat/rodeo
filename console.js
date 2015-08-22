// console
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
};
startPrompt();
// 4 spaces for python
jqconsole.SetIndentWidth(4);

// ctrl + l to clear
jqconsole.RegisterShortcut('l', function() {
  jqconsole.Clear();
});

// ctrl + a to skip to beginning of line
jqconsole.RegisterShortcut('a', function() {
  jqconsole.MoveToStart();
});

// ctrl + e to skip to end of line
jqconsole.RegisterShortcut('e', function() {
  jqconsole.MoveToEnd();
});

// ctrl + c to cancel input
jqconsole.RegisterShortcut('c', function() {
  jqconsole.ClearPromptText();
});

// ctrl + u to clear to beginning
jqconsole.RegisterShortcut('u', function() {
  var idx = jqconsole.GetColumn() - 4;
  var text = jqconsole.GetPromptText();
  jqconsole.SetPromptText(text.slice(0, idx));
});

// ctrl + w to clear to beginning
jqconsole.RegisterShortcut('z', function() {
  var idx = jqconsole.GetColumn() - 4;
  var text = jqconsole.GetPromptText();
  jqconsole.SetPromptText(text.slice(0, idx));
});

// ctrl + k to clear to beginning
jqconsole.RegisterShortcut('k', function() {
  var idx = jqconsole.GetColumn() - 4;
  var text = jqconsole.GetPromptText();
  jqconsole.SetPromptText(text.slice(idx));
});

// ctrl + w to clear one word backwards 
jqconsole.RegisterShortcut('w', function() {
  var idx = jqconsole.GetColumn() - 4;
  var text = jqconsole.GetPromptText().trim();
  var lidx = text.slice(0, idx).lastIndexOf(" ");
  if (lidx==-1) {
      lidx = 0;
  }
  text = text.slice(0, lidx) + " " + text.slice(idx+1);
  text = text.trim();
  jqconsole.SetPromptText(text);
});
// end console