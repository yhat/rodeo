import _ from 'lodash';

function clearBuffer(jqConsole, fn) {
  jqConsole.RegisterShortcut('l', () => fn());
}

function clearPrompt(jqConsole) {
  jqConsole.RegisterShortcut('c', function () {
    jqConsole.ClearPromptText();
  });
}

function moveCursorToEnd(jqConsole) {
  jqConsole.RegisterShortcut('e', function () {
    jqConsole.MoveToEnd();
  });
}

function moveCursorToStart(jqConsole) {
  jqConsole.RegisterShortcut('a', function () {
    jqConsole.MoveToStart();
  });
}

function interrupt(jqConsole, el, fn) {
  /**
   * If no prompt or input, the console doesn't receive events.
   *
   * We have to do it then.
   * @param {KeyboardEvent} event
   */
  el.addEventListener('keydown', function (event) {
    // ctrl-C
    if (
      (event.ctrlKey === true) &&
      (event.code === 'KeyC' || event.keyCode === 67) &&
      (jqConsole.GetState() !== 'prompt')
    ) {
      fn();
    }
  });
}

function autoComplete(jqConsole, fn) {
  jqConsole._IndentOld = jqConsole._Indent;
  jqConsole._Indent = () => {

    if (jqConsole.GetPromptText().trim() == '') {
      jqConsole._IndentOld();
    } else if (jqConsole.GetPromptText().slice(-1) == '\n') {
      jqConsole._IndentOld();
    } else {
      fn();
    }
  };
}

export default {
  autoComplete,
  clearBuffer,
  clearPrompt,
  interrupt,
  moveCursorToEnd,
  moveCursorToStart
};
