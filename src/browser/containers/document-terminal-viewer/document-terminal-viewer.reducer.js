import _ from 'lodash';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import cid from '../../services/cid';
import reduxUtil from '../../services/redux-util';
import promptViewerReducer from '../prompt-viewer/prompt-viewer.reducer';
import textUtil from '../../services/text-util';
import promptActionService from '../../services/prompt-actions';

const prefix = reduxUtil.fromFilenameToPrefix(__filename),
  responseTypeHandlers = {
    display_data: function (state, result) {
      const data = _.get(result, 'content.data');

      if (data) {
        state = addHistoryItem(state, {data, type: 'annotation', clickHandler: 'focusPlot'});
      }

      return state;
    },
    error: function (state, result) {
      const converter = textUtil.getAsciiToHtmlStream(),
        responseMsgId = _.get(result, 'parent_header.msg_id'),
        name = _.get(result, 'content.ename'),
        value = _.get(result, 'content.evalue'),
        traceback = _.get(result, 'content.traceback'),
        stacktrace = traceback.map(line => converter.toHtml(line));

      state = addHistoryItem(state, {name, stacktrace, traceback, type: 'pythonError', value});

      if (state.actives[responseMsgId]) {
        state = state.updateIn(['actives', responseMsgId], active => {
          const errors = active.errors && active.errors.asMutable() || [];

          active.set('errors', errors.concat([name, value, traceback]));

          return active;
        });
      }

      return state;
    },
    execute_input: function (state, result, responseMsgId) {
      let source = _.get(result, 'content.name'),
        text = _.get(result, 'content.code');

      if (!_.has(state, ['responses', responseMsgId, 'input'])) {
        state = addHistoryInputItem(state, source, text);
      }

      return state;
    },
    execute_result: function (state, result) {
      const data = _.get(result, 'content.data');

      return addMimeData(state, data);
    },
    execute_reply: function (state, result) {
      const payload = _.get(result, 'content.payload');

      _.each(payload, item => {
        state = addMimeData(state, item.data);
      });

      return state;
    },
    input_request: function (state, result) {
      return state.set('inputPrompt', result.content);
    },
    status: function (state, result) {
      const responseMsgId = _.get(result, 'parent_header.msg_id'),
        executionState = _.get(result, 'content.execution_state');

      if (executionState === 'busy') {
        state = state.setIn(['actives', responseMsgId], {});
      } else {
        state = state.update('actives', actives => actives.without(responseMsgId));
      }

      state = updateBusy(state);

      return addHistoryItem(state, {type: 'pageBreak'});
    },
    stream: function (state, result) {
      const source = _.get(result, 'content.name'),
        html = textUtil.fromAsciiToHtml(_.get(result, 'content.text'));

      return addHistoryItem(state, {html, type: 'text', source});
    }
  };

function updateBusy(state) {
  let isBusy = _.size(state.actives) > 0;

  if (isBusy && !state.busy) {
    state = state.set('busy', true);
  } else if (!isBusy && state.busy) {
    state = state.set('busy', false);
  }

  return state;
}

function addMimeData(state, data) {
  if (_.isObject(data) && data !== null) {
    if (data['text/plain']) {
      const html = textUtil.fromAsciiToHtml(data['text/plain']);

      state = addHistoryItem(state, {html, source: 'stdout', type: 'text'});
    } else {
      state = addHistoryItem(state, {data, type: 'annotation'});
    }
  }

  return state;
}

function addHistoryInputItem(state, source, text) {
  if (state.promptLabel) {
    text = text.split('\n').map((value, index) => {
      return index === 0 ? state.promptLabel + value : (state.continueLabel || state.promptLabel) + value;
    }).join('\n');
  }

  return addHistoryItem(state, {html: text, type: 'text', source});
}

function addHistoryItem(state, item) {
  return state.updateIn(['items'], items => {
    return items.concat([_.assign({id: cid()}, item)]);
  });
}

function executing(state, action) {
  if (action.payload.input) {
    state = state.set('busy', true); // assume busy immediately
    state = addHistoryInputItem(state, 'stdout', action.payload.input);
  }

  return promptActionService.execute(state);
}

function executed(state, action) {
  const responseToken = {};

  if (action.payload.input) {
    // remember that we already posted the input
    responseToken.input = action.payload.input;
  }

  if (action.error) {
    return addHistoryItem(state, {html: 'Unable to execute', source: 'stderr', type: 'text'});
  }

  if (state.responses) {
    return state.setIn(['responses', action.payload.responseMsgId], responseToken);
  }
}

/**
 * If any of the history blocks are jupyterResponse types, then they might need to be updated with new content
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function jupyterResponseDetected(state, action) {
  const responseMsgId = _.get(action, 'payload.result.parent_header.msg_id');

  if (responseMsgId && state.responses && state.responses[responseMsgId]) {
    const result = _.get(action, 'payload.result'),
      responseType = _.get(result, 'msg_type');

    if (responseTypeHandlers[responseType]) {
      state = responseTypeHandlers[responseType](state, result, responseMsgId);
    }
  }

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function changePreference(state, action) {
  switch (action.change.key) {
    case 'fontSize': return state.set('fontSize', _.toNumber(action.change.value));
    case 'cursorType': return state.set('cursorType', action.change.value);
    default: return state;
  }
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function workingDirectoryChanged(state, action) {
  if (action.cwd) {
    state = state.set('cwd', action.cwd);
  }

  return state;
}

function inputting(state) {
  return promptActionService.clear(state);
}

function inputted(state, action) {
  if (action.error) {
    return addHistoryItem(state, {html: 'Unable to input', source: 'stderr', type: 'text'});
  }

  return state.without('inputPrompt');
}

function interrupting(state) {
  return state;
}

function interrupted(state, action) {
  if (action.error) {
    return addHistoryItem(state, {html: 'Unable to interrupt terminal', source: 'stderr', type: 'text'});
  }

  return state;
}

function restarting(state) {
  return addHistoryItem(state, {html: 'restarting terminal...', source: 'stdout', type: 'text'});
}

function restarted(state, action) {
  if (action.error) {
    return addHistoryItem(state, {html: 'Unable to restart terminal', source: 'stderr', type: 'text'});
  } else {
    state = state.without('terminalError', 'terminalClosed');
  }

  state = Immutable(promptActionService.clear(state));
  state = state.set('actives', {});
  state = updateBusy(state);
  return addHistoryItem(state, {html: 'done', source: 'stdout', type: 'text'});
}

function clear(state) {
  return state.set('items', []);
}

/**
 * @param {Array} state
 * @returns {Array};
 */
function removeLastHistoryItem(state) {
  const items = state.items.asMutable();

  items.pop();

  return state.set('items', items);
}

function autocomplete(state, action) {
  const matches = action.payload,
    lastItem = _.last(state.items);

  if (lastItem && lastItem.type === 'autocomplete') {
    state = removeLastHistoryItem(state);
  }

  return addHistoryItem(state, {type: 'autocomplete', matches});
}

function clearAutocomplete(state) {
  const lastItem = _.last(state.items);

  if (lastItem && lastItem.type === 'autocomplete') {
    state = removeLastHistoryItem(state);
  }

  return state;
}

function promptCommand(state, action) {
  const command = action.payload;

  if (command.clearAutocomplete) {
    state = clearAutocomplete(state, action);
  }

  return state;
}

function jupyterProcessError(state, action) {
  return state.set('terminalError', action.payload);
}

function jupyterProcessClosed(state, action) {
  return state.set('terminalClosed', action.payload);
}

function kernelRestarted(state, action) {
  if (!action.error) {
    state = state.without('terminalError', 'terminalClosed');
  }

  return state;
}

export default reduxUtil.reduceReducers(
  mapReducers(
    _.assign(reduxUtil.addPrefixToKeys(prefix, {
      AUTOCOMPLETE: autocomplete,
      CLEAR_AUTOCOMPLETE: clearAutocomplete,
      CLEAR: clear,
      INTERRUPTING: interrupting,
      INTERRUPTED: interrupted,
      EXECUTING: executing,
      EXECUTED: executed,
      RESTARTING: restarting,
      RESTARTED: restarted,
      INPUTTING: inputting,
      INPUTTED: inputted
    }), {
      JUPYTER_RESPONSE: jupyterResponseDetected,
      JUPYTER_PROCESS_ERROR: jupyterProcessError,
      JUPYTER_PROCESS_CLOSED: jupyterProcessClosed,
      KERNEL_RESTARTED: kernelRestarted,
      PREFERENCE_CHANGE_SAVED: changePreference,
      WORKING_DIRECTORY_CHANGED: workingDirectoryChanged,
      PROMPT_VIEWER_COMMAND: promptCommand
    }), {}),
  promptViewerReducer
);
