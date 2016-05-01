import React from 'react';
import Terminal from './terminal.jsx';

let msg = `
IPython -- An enhanced Interactive Python.
?         -> Introduction and overview of IPython's features.
%quickref -> Quick reference.
help      -> Python's own help system.
object?   -> Details about 'object', use 'object??' for extra details.
`;


export default React.createClass({
  displayName: 'JupyterClientViewer',
//   componentDidMount: function () {
//     const jqConsole = $(ReactDOM.findDOMNode(this)).jqconsole(msg, '>>> ');
//
//     // 4 spaces for python
//     jqConsole.SetIndentWidth(4);
//
// // ctrl + l to clear
//     jqConsole.RegisterShortcut('l', function () {
//       jqConsole.Clear();
//     });
//
// // ctrl + a to skip to beginning of line
//     jqConsole.RegisterShortcut('a', function () {
//       jqConsole.MoveToStart();
//     });
//
// // ctrl + e to skip to end of line
//     jqConsole.RegisterShortcut('e', function () {
//       jqConsole.MoveToEnd();
//     });
//
// // ctrl + c to cancel input
//     jqConsole.RegisterShortcut('c', function () {
//       const $interrupt = $('#btn-interrupt');
//
//       if (!$interrupt.hasClass('hide')) {
//         $interrupt.click();
//       } else {
//         jqConsole.ClearPromptText();
//       }
//     });
//
// // ctrl + u to clear to beginning
//     jqConsole.RegisterShortcut('u', function () {
//       const text = jqConsole.GetPromptText().slice(jqConsole.GetColumn() - 4);
//
//       jqConsole.SetPromptText(text);
//     });
//
// // ctrl + k to clear to end
//     jqConsole.RegisterShortcut('k', function () {
//       const text = jqConsole.GetPromptText().slice(0, jqConsole.GetColumn() - 4);
//
//       jqConsole.SetPromptText(text);
//     });
//
// // ctrl + w to clear one word backwards
//     jqConsole.RegisterShortcut('w', function () {
//       const idx = jqConsole.GetColumn() - 4;
//       let text = jqConsole.GetPromptText().trim(),
//         lidx = text.slice(0, idx).lastIndexOf(' ');
//
//       if (lidx == -1) {
//         lidx = 0;
//       }
//
//       text = text.slice(0, lidx) + ' ' + text.slice(idx + 1);
//       text = text.trim();
//       jqConsole.SetPromptText(text);
//     });
//
//     jqConsole.RegisterShortcut('1', function () {
//       focusOnEditor();
//     });
//
//     jqConsole.RegisterShortcut('3', function () {
//       focusOnTopRight();
//     });
//
//     jqConsole.RegisterShortcut('4', function () {
//       focusOnBottomRight();
//     });
//
//     // autocomplete
//     jqConsole._IndentOld = jqConsole._Indent;
//     jqConsole._Indent = function () {
//       if (jqConsole.GetPromptText().trim() == '') {
//         jqConsole._IndentOld();
//       } else if (jqConsole.GetPromptText().slice(-1) == '\n') {
//         jqConsole._IndentOld();
//       } else {
//         let originalPrompt = jqConsole.GetPromptText(),
//           code = jqConsole.GetPromptText();
//
//         code = code.slice(0, jqConsole.GetColumn() - 4);
//
//         jqConsole.ClearPromptText(true);
//
//         executeCommand(code, true, handleExecuteCommand(originalPrompt, code));
//       }
//     };
//
//     this.jqConsole = jqConsole;
//   },
  render: function () {
    return (
      <Terminal message={msg} />
    );
  }
});