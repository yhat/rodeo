import $ from 'jquery';
import _ from 'lodash';
import client from '../../services/client';
import store from '../../services/store';
import cid from '../../services/cid';
import AsciiToHtml from 'ansi-to-html';
import {errorCaught} from '../../actions/application';
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
          .then(() => _.defer(() => {
            dispatch(startPrompt(jqConsole));
          }));
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
 * @param {object} jqConsole
 * @param {object} data
 */
function appendPNG(jqConsole, data) {
  const src = data['image/png'];

  jqConsole.Append(`<img src="${src}">`);
  jqConsole.Write('\n');
}

/**
 * @param {object} jqConsole
 * @param {object} data
 */
function appendSVG(jqConsole, data) {
  const src = data['image/svg'];

  jqConsole.Append(`<img src="${src}">`);
  jqConsole.Write('\n');
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
      appendPNG(jqConsole, data);
      // do nothing at the moment
    } else if (data['image/svg']) {
      appendSVG(jqConsole, data);
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

    jqConsole.Focus();

    client.restartInstance()
      .then(function () {
        jqConsole.Reset();
      })
      .catch(function (error) {
        return dispatch(errorCaught(error));
      });
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

export default {
  addDisplayData,
  addInputText,
  addErrorText,
  addOutputText,
  execute,
  interrupt,
  focus,
  restart,
  startPrompt
};
