import $ from 'jquery';
import _ from 'lodash';
import AsciiToHtml from 'ansi-to-html';
import client from '../../services/client';
import cid from '../../services/cid';
import {errorCaught} from '../../actions/application';
import kernelActions from '../../actions/kernel';
import freeTabGroupActions from '../free-tab-group/free-tab-group.actions';
import {local} from '../../services/store';
import textUtil from '../../services/text-util';
import commonTabsActions from '../../services/common-tabs-actions';
import ipc from 'ipc';
const convertor = new AsciiToHtml(),
  inputBuffer = [],
  tabGroupName = 'terminalTabGroups';

function getJQConsole(id) {
  const el = document.querySelector('#' + id),
    terminalEl = el && el.querySelector('.terminal');

  return terminalEl && $(terminalEl).data('jqconsole');
}

function startPrompt(groupId, id) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        const nextPrompt = () => _.defer(() => dispatch(startPrompt(groupId, id)));

        if (jqConsole.GetState() !== 'prompt') {
          jqConsole.Prompt(true, (input) => dispatch(executeWithCallback(input, nextPrompt)));
        }

        client.guaranteeInstance()
          .catch(error => dispatch(errorCaught(error)));

        _.defer(() => {
          if (inputBuffer.length && jqConsole.GetState() === 'prompt') {
            dispatch(addInputText(groupId, id, inputBuffer.shift()));
          }
        });
      }
    }
  };
}

function handleExecuteError(dispatch) {
  return function (error) {
    dispatch(addJSError(error));
    dispatch(errorCaught(error));
  };
}

function executeWithCallback(cmd, done) {
  return function (dispatch) {
    return client.execute(cmd)
      .catch(handleExecuteError(dispatch))
      .nodeify(done);
  };
}

/**
 * Atomic code should not be added/concatenated with other code
 *
 * Complete code is runnable as it is, but should be merged with current code on the prompt
 *
 * Code that is neither atomic or complete is just added to the prompt, waiting to be edited or completed.
 *
 * @param {string} groupId
 * @param {string} id
 * @param {object} context
 * @param {string} context.text
 * @param {boolean} [context.isCodeIsolated=false]
 * @param {boolean} [context.isCodeRunnable=false]
 * @returns {Function}
 */
function addInputText(groupId, id, context) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        const text = context.text,
          consoleState = jqConsole.GetState();

        // if a prompt is waiting for this input
        if (consoleState === 'prompt') {
          const promptText = jqConsole.GetPromptText(),
            fullText = promptText + text;

          // execute if able
          if (context.isCodeIsolated) {
            // isolated code leaves the prompt alone, still visibly runs the code
            // even if the code is not runnable, run it anyway so they can see the error
            jqConsole.SetPromptText(text);
            jqConsole.AbortPrompt();
            jqConsole.SetHistory(jqConsole.GetHistory().concat([text]));
            return client.execute(text)
              .catch(error => dispatch(errorCaught(error)))
              .then(() => _.defer(() => dispatch(startPrompt(groupId, id))));
          } else if (context.isCodeRunnable) {
            // pretend to run from the prompt: kill the prompt, run the code, start the prompt, lie
            jqConsole.SetPromptText(fullText);
            jqConsole.AbortPrompt();
            jqConsole.SetHistory(jqConsole.GetHistory().concat([fullText]));
            return client.execute(fullText)
              .catch(error => dispatch(errorCaught(error)))
              .then(() => _.defer(() => dispatch(startPrompt(groupId, id))));
          } else {
            jqConsole.ClearPromptText();
            jqConsole.SetPromptText(fullText + '\n');
          }
        } else {
          // buffer the command for when they're done
          inputBuffer.push(context);
        }
      }
    }
  };
}

/**
 * Free-flowing text output (no color, no html)
 * @param {string} groupId
 * @param {string} id
 * @param {string} text
 * @returns {function}
 */
function addOutputText(groupId, id, text) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        jqConsole.Write(text + '\n', 'jqconsole-output');
      }
    }
  };
}

/**
 * Text output put into an HTML container
 * Converts colored ANSI to HTML.
 * @param {string} groupId
 * @param {string} id
 * @param {string} text
 * @returns {function}
 */
function addOutputBlock(groupId, id, text) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        const className = 'jqconsole-output',
          htmlEscape = false;

        jqConsole.Write('<span class="terminal-block">' + convertor.toHtml(text) + '</span>\n', className, htmlEscape);
      }
    }
  };
}

/**
 *
 * @param {string} groupId
 * @param {string} id
 * @param {Error} error
 * @returns {Function}
 */
function addJSError(groupId, id, error) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        const htmlEscape = true,
          className = 'jqconsole-output';

        jqConsole.Write(error.message + '\n', className, htmlEscape);
      }
    }
  };
}

/**
 * @param {string} groupId
 * @param {string} id
 * @param {string} ename
 * @param {string} evalue
 * @param {[string]} traceback
 * @returns {function}
 */
function addErrorText(groupId, id, ename, evalue, traceback) {
  traceback = traceback && _.map(traceback, str => convertor.toHtml(str)).join('<br />');

  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        const htmlEscape = false,
          className = 'jqconsole-output';

        jqConsole.Write(traceback + '\n', className, htmlEscape);
      }
    }
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
        dispatch(freeTabGroupActions.focusNewestPlot());
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
        dispatch(freeTabGroupActions.focusNewestPlot());
      });
  });
}

/**
 * Update a terminal with display data
 * @param {string} groupId
 * @param {string} id
 * @param {object} data
 * @returns {function}
 */
function addDisplayData(groupId, id, data) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        if (data['text/html']) {
          if (local.get('allowIFrameInTerminal')) {
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
      }
    }
  };
}

/**
 *
 * @param {string} groupId
 * @param {string} id
 * @returns {function}
 */
function interrupt(groupId, id) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        const consoleState = jqConsole.GetState();

        client.interrupt()
          .catch(error => dispatch(errorCaught(error)));
        if (consoleState !== 'output') {
          jqConsole.ClearPromptText();
        }
      }
    }
  };
}

/**
 * @param {string} groupId
 * @param {string} id
 * @returns {function}
 */
function restart(groupId, id) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
        if (jqConsole.GetState() === 'prompt') {
          jqConsole.AbortPrompt();
        }
        jqConsole.Write('restarting terminal... ');

        client.restartInstance()
          .then(() => {
            jqConsole.Write('done\n');
            dispatch(kernelActions.detectKernelVariables());
            _.defer(() => dispatch(startPrompt(groupId, id)));
          })
          .catch(error => dispatch(errorCaught(error)));
      } else {
        dispatch(errorCaught(new Error('Cannot restart without terminal')));
      }
    }
  };
}

/**
 * @param {string} groupId
 * @param {string} id
 * @returns {function}
 */
function focus(groupId, id) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch) {
    const jqConsole = getJQConsole(id);

    if (jqConsole) {
      // side-effect?  Can this be moved to component?  (Not yet.)
      jqConsole.Focus();
    }

    dispatch({type: 'FOCUS_TAB', groupId, id});
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

/**
 * @param {string} groupId
 * @param {string} id
 * @returns {Function}
 */
function autoComplete(groupId, id) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const jqConsole = getJQConsole(id);

      if (jqConsole) {
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
      }
    }
  };
}
/**
 * @param {string} clientId
 * @param {number} code
 * @param {string} signal
 * @returns {function}
 */
function handleProcessClose(clientId, code, signal) {

  return function () {
    console.log('handleProcessClose', {clientId, code, signal});

    // todo: only show after the startup is done

    // if (code) {
    //   dispatch(addOutputText('Process closed (exit code: ' + code + '), restarting.'));
    // } else if (signal) {
    //   dispatch(addOutputText('Process closed (signal: ' + signal + '), restarting.'));
    // } else {
    //   dispatch(addOutputText('Process closed, restarting.'));
    // }

    return client.dropInstance();
  };
}

/**
 * @param {string} groupId
 * @param {string} id
 * @returns {function}
 */
function clearBuffer(groupId, id) {
  if (!_.isString(groupId) || !_.isString(id)) {
    throw new Error('Missing groupId or id');
  }

  return function (dispatch, getState) {
    const state = getState(),
      terminal = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    if (terminal) {
      const el = document.querySelector('#' + id),
        jqConsole = getJQConsole(id),
        extras = el && el.querySelectorAll('img,iframe');

      if (jqConsole) {
        jqConsole.Clear();

        // anything else we've added should be removed too
        _.each(extras, function (extra) {
          const parent = extra.parentNode;

          parent.removeChild(extra);
        });
      }
    }
  };
}

function byClientIdToActiveTab(fn) {
  return function (clientId) {
    const otherArgs = _.slice(arguments, 1);

    console.warn('Received by clientId, but not implemented yet.  Just pushing ' +
      'to active terminal for now.', {clientId});

    return function (dispatch, getState) {
      const state = getState(),
        groupIndex = commonTabsActions.getGroupIndex(state[tabGroupName]);

      if (groupIndex > -1) {
        const groupId = state[tabGroupName][groupIndex].groupId,
          active = state[tabGroupName][groupIndex].active;

        return dispatch(fn.apply(null, [groupId, active].concat(otherArgs)));
      }
    };
  };
}

function showSelectWorkingDirectoryDialog(groupId, id) {
  return function (dispatch, getState) {
    const state = getState(),
      content = commonTabsActions.getContent(state.terminalTabGroups, groupId, id);

    return ipc.send('openDialog', {
      title: 'Select a folder',
      defaultPath: content.cwd || local.get('workingDirectory'),
      properties: ['openDirectory']
    }).then(function (result) {
      if (_.isArray(result) && result.length > 0) {
        result = result[0];
      }

      console.log('results!!', {result, groupId, id});

      if (_.isString(result)) {
        return dispatch(addInputText(groupId, id, {text: `cd "${result}"`, isCodeIsolated: true}));
      }
    }).catch(error => dispatch(errorCaught(error)));
  };
}

function detectVariables() {
  return function (dispatch) {
    return dispatch(kernelActions.detectKernelVariables());
  };
}

export default {
  addDisplayData,
  addDisplayDataByClientId: byClientIdToActiveTab(addDisplayData),
  addInputText,
  addInputTextToActiveTab: commonTabsActions.toActiveTab(tabGroupName, addInputText),
  addInputTextByClientId: byClientIdToActiveTab(addInputText),
  addErrorText,
  addErrorTextByClientId: byClientIdToActiveTab(addErrorText),
  addOutputText,
  addOutputTextByClientId: byClientIdToActiveTab(addOutputText),
  addOutputBlock,
  addOutputBlockByClientId: byClientIdToActiveTab(addOutputBlock),
  interrupt,
  interruptActiveTab: commonTabsActions.toActiveTab(tabGroupName, interrupt),
  clearBuffer,
  clearBufferOfActiveTab: commonTabsActions.toActiveTab(tabGroupName, clearBuffer),
  focus,
  focusActiveTab: commonTabsActions.toActiveTab(tabGroupName, focus),
  restart,
  restartActiveTab: commonTabsActions.toActiveTab(tabGroupName, restart),
  startPrompt,
  detectVariables,
  autoComplete,
  handleProcessClose,
  showSelectWorkingDirectoryDialog
};
