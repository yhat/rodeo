import $ from 'jquery';
import _ from 'lodash';
import AsciiToHtml from 'ansi-to-html';
import client from '../../services/client';
import cid from '../../services/cid';
import {errorCaught} from '../../actions/application';
import plotViewerActions from '../plot-viewer/plot-viewer.actions';
import store from '../../services/store';
import textUtil from '../../services/text-util';
const convertor = new AsciiToHtml(),
  inputBuffer = [];

function getJQConsole(id) {
  const el = document.querySelector('#' + id);

  return el && $(el).data('jqconsole');
}

function startPrompt(jqConsole) {
  return function (dispatch) {
    const nextPrompt = () => _.defer(() => dispatch(startPrompt(jqConsole)));

    jqConsole.Prompt(true, (input) => dispatch(execute(input, nextPrompt)));

    _.defer(() => {
      if (inputBuffer.length && jqConsole.GetState() === 'prompt') {
        console.log('running buffer', _.map(inputBuffer, 'text'));
        dispatch(addInputText(inputBuffer.shift()));
      }
    });
  };
}

function execute(cmd, done) {
  return function (dispatch) {
    return client.execute(cmd)
      .catch(error => dispatch(errorCaught(error)))
      .nodeify(done);
  };
}

function addInputText(context) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      jqConsole = getJQConsole(terminal.id),
      text = context.text,
      consoleState = jqConsole.GetState();

    // if a prompt is waiting for this input
    if (consoleState === 'prompt') {
      const fullText = jqConsole.GetPromptText() + text;

      // execute if able
      if (context.isCodeComplete) {
        // pretend to run from the prompt: kill the prompt, run the code, start the prompt, lie
        jqConsole.SetPromptText(fullText);
        jqConsole.AbortPrompt();
        jqConsole.SetHistory(jqConsole.GetHistory().concat([fullText]));
        return client.execute(fullText)
          .catch(error => dispatch(errorCaught(error)))
          .then(() => _.defer(() => dispatch(startPrompt(jqConsole))));
      } else {
        jqConsole.ClearPromptText();
        jqConsole.SetPromptText(fullText + '\n');
      }
    } else {
      // buffer the command for when they're done
      inputBuffer.push(context);
    }
  };
}

/**
 * @param {string} text
 * @returns {function}
 */
function addOutputText(text) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      jqConsole = getJQConsole(terminal.id);

    jqConsole.Write(text + '\n', 'jqconsole-output');
  };
}

/**
 * @param {string} ename
 * @param {string} evalue
 * @param {[string]} traceback
 * @returns {function}
 */
function addErrorText(ename, evalue, traceback) {
  traceback = traceback && _.map(traceback, str => convertor.toHtml(str)).join('<br />');

  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      jqConsole = getJQConsole(terminal.id),
      htmlEscape = false,
      className = 'jqconsole-output';

    jqConsole.Write(traceback + '\n', className, htmlEscape);
  };
}

/**
 * @param {object} jqConsole
 * @param {object} data
 */
function appendIFrame(jqConsole, data) {
  let iframeId = cid(),
    str = `<iframe style="resize: vertical; width: 100%" seamless id="${iframeId}" src="${data['text/html']}" sandbox="allow-scripts"></iframe>`;

  jqConsole.Append(str);
  jqConsole.Write('\n');
}

/**
 * @param {function} dispatch
 * @param {object} jqConsole
 * @param {object} data
 */
function appendPNG(dispatch, jqConsole, data) {
  const src = data['image/png'],
    id = cid();

  jqConsole.Append(`<img id=${id} src="${src}">`);

  _.defer(function () {
    document.querySelector('#' + id)
      .addEventListener('click', function () {
        dispatch(plotViewerActions.focusNewestPlot());
      });
  });
}

/**
 * @param {function} dispatch
 * @param {object} jqConsole
 * @param {object} data
 */
function appendSVG(dispatch, jqConsole, data) {
  const src = data['image/svg'],
    id = cid();

  jqConsole.Append(`<img id=${id} src="${src}">`);

  _.defer(function () {
    document.querySelector('#' + id)
      .addEventListener('click', function () {
        dispatch(plotViewerActions.focusNewestPlot());
      });
  });
}

/**
 * Update the terminal with display data
 * @param {object} data
 * @returns {function}
 */
function addDisplayData(data) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      jqConsole = getJQConsole(terminal.id);

    if (data['text/html']) {
      if (store.get('allowIFrameInTerminal')) {
        appendIFrame(jqConsole, data);
      }
    } else if (data['image/png']) {
      appendPNG(dispatch, jqConsole, data);
      // do nothing at the moment
    } else if (data['image/svg']) {
      appendSVG(dispatch, jqConsole, data);
    } else {
      console.warn('addDisplayData', 'unknown data type', data);
    }
  };
}

function interrupt() {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      jqConsole = getJQConsole(terminal.id),
      consoleState = jqConsole.GetState();

    client.interrupt()
      .catch(function (error) {
        return dispatch(errorCaught(error));
      });
    if (consoleState !== 'output') {
      jqConsole.ClearPromptText();
    }
  };
}

function restart() {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      jqConsole = getJQConsole(terminal.id);

    if (jqConsole.GetState() === 'prompt') {
      jqConsole.AbortPrompt();
    }
    jqConsole.Write('restarting terminal... ');

    client.restartInstance()
      .then(function () {
        jqConsole.Write('done\n');
        _.defer(() => dispatch(startPrompt(jqConsole)));
      })
      .catch(error => dispatch(errorCaught(error)));
  };
}

function focus() {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      jqConsole = getJQConsole(terminal.id);

    jqConsole.Focus();
  };
}

function withContentAndPosition(jqConsole, fn) {
  let after, before, currentLeft, current, cursorPos;
  const NEWLINE = '\n',
    getPromptLines = function (node) {
      let buffer = [];

      node.children().each(function () {
        return buffer.push($(this).children().last().text());
      });
      return buffer.join(NEWLINE);
    };

  before = getPromptLines(jqConsole.$prompt_before);
  if (before) {
    before += NEWLINE;
  }
  currentLeft = jqConsole.$prompt_left.text();
  cursorPos = before.length + currentLeft.length;
  current = currentLeft + jqConsole.$prompt_right.text();
  after = getPromptLines(jqConsole.$prompt_after);
  if (after) {
    after = NEWLINE + after;
  }

  return fn(before + current + after, cursorPos);
}

function autoComplete() {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      jqConsole = getJQConsole(terminal.id);

    withContentAndPosition(jqConsole, function (code, cursorPos) {
      client.getAutoComplete(code, cursorPos)
        .then(function (result) {
          const matches = result.matches,
            start = result.cursor_start,
            len = result.cursor_end - start,
            className = 'jqconsole-output',
            htmlEscape = false,
            longestLen = textUtil.longestLength(matches);
          let paddedMatches, suggestions;

          if (matches.length === 1) {
            // if only a single match, just replace it
            return jqConsole.SetPromptText(textUtil.spliceString(code, start, len, matches[0]));
          } else if (matches.length > 0) {
            paddedMatches = matches.map(match => textUtil.padRight(match, longestLen));
            suggestions = paddedMatches.map(function (match) {
              match = $(jqConsole.ansi.stylize($('<span />').text(match).html()))[0];
              match.classList.add('terminal-item');
              return match.outerHTML;
            }).join('');

            jqConsole.Write('<span class="terminal-list">' + suggestions + '</span>', className, htmlEscape);
          }
        })
        .catch(error => dispatch(errorCaught(error)));
    });
  };
}

export default {
  addDisplayData,
  addInputText,
  addErrorText,
  addOutputText,
  execute,
  interrupt,
  focus,
  restart,
  startPrompt,
  autoComplete
};
