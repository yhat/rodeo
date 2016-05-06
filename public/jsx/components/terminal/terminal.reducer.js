import _ from 'lodash';
import $ from 'jquery';
import cid from '../../services/cid';
import * as store from '../../services/store';

/*
Available classes:

 jqconsole: The main console container.
 jqconsole, jqconsole-blurred: The main console container, when not in focus.
 jqconsole-cursor: The cursor.
 jqconsole-header: The welcome message at the top of the console.
 jqconsole-input: The prompt area during input. May have multiple lines.
 jqconsole-old-input: Previously-entered inputs.
 jqconsole-prompt: The prompt area during prompting. May have multiple lines.
 jqconsole-old-prompt: Previously-entered prompts.
 jqconsole-composition: The div encapsulating the composition of multi-byte characters.
 jqconsole-prompt-text: the text entered in the current prompt
 */

const initialState = [getDefault()];

function getDefault() {
  return {
    label: 'Console',
    id: cid(),
    tabId: cid(),
    hasFocus: true,
    icon: 'terminal',
    fontSize: 12,
    status: 'idle'
  };
}

function getTerminalConsole(action) {
  const el = document.querySelector('#' + action.id);

  return el && $(el).data('jqconsole');
}

function setTerminalState(state, action) {
  const instance = _.find(state, {id: action.id});

  if (instance.status !== action.status) {
    state = _.clone(state);
    instance.status = action.status;
  }

  return state;
}

function addTerminalExecutedInput(state, action) {
  const jqconsole = getTerminalConsole(action);

  jqconsole.Write(action.code + '\n');

  return state;
}

function addTerminalText(state, action) {
  const jqconsole = getTerminalConsole(action);

  jqconsole.Write(action.text + '\n', 'jqconsole-output');

  return state;
}

/**
 * @param {object} jqconsole
 * @param {object} data
 */
function appendIFrame(jqconsole, data) {
  let iframeId = cid(),
    str = `<iframe style="resize: vertical; width: 100%" seamless id="${iframeId}" src="${data['text/html']}" sandbox="allow-scripts"></iframe>`;

  jqconsole.Append(str);
  jqconsole.Write('\n');
}

/**
 * @param {object} jqconsole
 * @param {object} data
 */
function appendPNG(jqconsole, data) {
  const src = data['image/png'];

  jqconsole.Append(`<img src="${src}">`);
  jqconsole.Write('\n');
}

/**
 * @param {object} jqconsole
 * @param {object} data
 */
function appendSVG(jqconsole, data) {
  const src = data['image/svg'];

  jqconsole.Append(`<img src="${src}">`);
  jqconsole.Write('\n');
}

function addTerminalDisplayData(state, action) {
  const jqconsole = getTerminalConsole(action),
    data = action.data;

  if (data['text/html']) {
    if (store.get('allowIFrameInTerminal')) {
      appendIFrame(jqconsole, data);
    }
  } else if (data['image/png']) {
    appendPNG(jqconsole, data);
    // do nothing at the moment
  } else if (data['image/svg']) {
    appendSVG(jqconsole, data);
  }

  return state;
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'TERMINAL_STATE': return setTerminalState(state, action);
    case 'ADD_TERMINAL_EXECUTED_INPUT': return addTerminalExecutedInput(state, action);
    case 'ADD_TERMINAL_TEXT': return addTerminalText(state, action);
    case 'ADD_DISPLAY_DATA': return addTerminalDisplayData(state, action);
    default: return state;
  }
}