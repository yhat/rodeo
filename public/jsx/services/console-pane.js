import $ from 'jquery';
import * as store from './store';
import AsciiTable from 'ascii-table';
import { sendCommand, executeCommand } from './execute';
import { focusOnEditor, focusOnTopRight, focusOnBottomRight } from './focus';

let $console, jqConsole;

const msg = `IPython -- An enhanced Interactive Python.
?         -> Introduction and overview of IPython's features.
%quickref -> Quick reference.
help      -> Python's own help system.
object?   -> Details about 'object', use 'object??' for extra details.`;

export function startConsole() {
  $console = $('#console');
  jqConsole = $console.jqconsole(msg, '>>> ');

  // 4 spaces for python
  jqConsole.SetIndentWidth(4);

// ctrl + l to clear
  jqConsole.RegisterShortcut('l', function () {
    jqConsole.Clear();
  });

// ctrl + a to skip to beginning of line
  jqConsole.RegisterShortcut('a', function () {
    jqConsole.MoveToStart();
  });

// ctrl + e to skip to end of line
  jqConsole.RegisterShortcut('e', function () {
    jqConsole.MoveToEnd();
  });

// ctrl + c to cancel input
  jqConsole.RegisterShortcut('c', function () {
    const $interrupt = $('#btn-interrupt');

    if (!$interrupt.hasClass('hide')) {
      $interrupt.click();
    } else {
      jqConsole.ClearPromptText();
    }
  });

// ctrl + u to clear to beginning
  jqConsole.RegisterShortcut('u', function () {
    const text = jqConsole.GetPromptText().slice(jqConsole.GetColumn() - 4);

    jqConsole.SetPromptText(text);
  });

// ctrl + k to clear to end
  jqConsole.RegisterShortcut('k', function () {
    const text = jqConsole.GetPromptText().slice(0, jqConsole.GetColumn() - 4);

    jqConsole.SetPromptText(text);
  });

// ctrl + w to clear one word backwards
  jqConsole.RegisterShortcut('w', function () {
    const idx = jqConsole.GetColumn() - 4;
    let text = jqConsole.GetPromptText().trim(),
      lidx = text.slice(0, idx).lastIndexOf(' ');

    if (lidx == -1) {
      lidx = 0;
    }

    text = text.slice(0, lidx) + ' ' + text.slice(idx + 1);
    text = text.trim();
    jqConsole.SetPromptText(text);
  });

  jqConsole.RegisterShortcut('1', function () {
    focusOnEditor();
  });

  jqConsole.RegisterShortcut('3', function () {
    focusOnTopRight();
  });

  jqConsole.RegisterShortcut('4', function () {
    focusOnBottomRight();
  });
}



/**
 *
 * @param {string} originalPrompt
 * @param {string} code
 * @returns {function}
 */
function handleExecuteCommand(originalPrompt, code) {
  return function (result) {
    if (!result) {
      return;
    }

    let predictions = JSON.parse(result.output);

    if (predictions.length == 1) {
      return jqConsole.SetPromptText(getCompletedText(predictions, originalPrompt, code));
    }

    // otherwise we need to display potential completions
    jqConsole.Write(getTable(predictions).render() + '\n\n', 'jqconsole-output');
    startPrompt();
    jqConsole.SetPromptText(originalPrompt);
  };
}

/**
 *
 * @param {Array} predictions
 * @param {string} originalPrompt
 * @param {string} code
 * @returns {string}
 */
function getCompletedText(predictions, originalPrompt, code) {
  // if only 1 suggestion comes back then we'll take the liberty and finish
  // the autocomplete
  let completedText,
    prediction = predictions[0].text;

  originalPrompt = originalPrompt.replace('~', store.get('userHome'));
  completedText = originalPrompt.replace(code, prediction);

  for (let i = prediction.length; i > 0; i--) {
    let p = prediction.slice(0, i);

    if (originalPrompt.slice(-p.length) == p) {
      completedText = originalPrompt + prediction.slice(i);
      break;
    }
  }

  return completedText;
}

/**
 * @param {Array} predictions
 * @returns {*}
 */
function getTable(predictions) {
  // a good ratio for characters:pixels is 1:6.4. we're going to use this
  // to make our ascii table look pretty in the space that we have
  const widthChars = $console.width() / 6.4,

  // I tried fiding the longest string and then adding 5 characters, but
  // just using 20 and padding 5 characters seems to be working better...
    longestString = 20,
    nCols = Math.round(widthChars / (longestString + 5)),
    table = new AsciiTable();
  let row = [];

  for (let i = 0; i < predictions.length; i++) {
    let text;

    // so apparently the predictions sometimes don't come back as { text: "foo"}
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

  return table;
}

export function startPrompt() {
  // Start the prompt with history enabled.
  jqConsole.Prompt(true, function (input) {
    sendCommand(input);
    // Restart the prompt.
    startPrompt();
  });
}

export function write(str) {
  jqConsole.Write(str);
}

export function setPromptText(str) {
  jqConsole.SetPromptText(str);
}

export function focus() {
  jqConsole.focus();
}