/**
 * These functions map up to functions referenced in ./editor-commands.yml
 *
 * @module
 */

import _ from 'lodash';
import commonTabsActions from '../../services/common-tabs-actions';
import applicationControl from '../../services/application-control';
import freeTabActions from '../free-tab-group/free-tab-group.actions';
import documentTerminalViewerActions from '../document-terminal-viewer/document-terminal-viewer.actions';
import blockTerminalViewerActions from '../block-terminal-viewer/block-terminal-viewer.actions';
import dialogActions from '../../actions/dialogs';

const editorTabGroupName = 'editorTabGroups',
  pythonTypes = ['python'],
  sqlTypes = ['sql', 'pgsql', 'mysql', 'sqlserver'];

function getIndentLevel(session, content) {
  content = _.trimEnd(content); // line of all spaces doesn't count
  const tabSize = session.getTabSize();
  let match = content.match(/(^[ \t]*)/),
    indent = match && match[1] || '';

  // replace tabs with spaces
  indent = indent.replace('\t', _.repeat(' ', tabSize));

  return indent.length;
}

/**
 * Likely, this doesn't belong here.
 *
 * Determine if code is "complete" and therefore should be run
 * @param {*} editor
 * @returns {boolean}
 */
function isCodeRunnable(editor) {
  const currentRow = editor.getSelectionRange().end.row,
    session = editor.session,
    totalRows = session.getLength();

  let nextRow = currentRow + 1,
    nextRowContent = session.getLine(nextRow),
    nextIndent = nextRowContent && getIndentLevel(session, nextRowContent);

  // skip rows without content
  while (nextRow < totalRows && nextRowContent.trim() === '') {
    nextRow = nextRow + 1;
    nextRowContent = session.getLine(nextRow);
    nextIndent = nextRowContent && getIndentLevel(session, nextRowContent);
  }

  return !!(
    (nextRow === totalRows) || // end of file
    (nextRow < totalRows && nextIndent === 0) // no indent for next line of content
  );
}

/**
 * Go to the next line, even if we have to make a new line to do it
 * @param {*} editor
 */
function forceGoToNextLine(editor) {
  const currentRow = editor.getSelectionRange().end.row,
    nextRow = currentRow + 1,
    session = editor.session;

  if (nextRow === session.getLength()) {
    session.setValue(session.getValue() + '\n');
  }
  editor.gotoLine(currentRow + 2, 10, true);
}

function getSelectionOrLine(editor) {
  let text = editor.getCopyText();

  // if nothing is selected, run the current line
  if (!text || !text.length) {
    const currentRow = editor.getSelectionRange().end.row;

    text = editor.session.getLine(currentRow);
  }

  return text;
}

function interrupt() {
  return freeTabActions.interrupt();
}

function openPreferences() {
  return dialogActions.showPreferences();
}

function indentSelection(groupId, id, editor) {
  return function () {
    if (editor.getSelectedText()) {
      editor.blockIndent(editor.getSelectionRange());
    } else {
      editor.blockIndent(editor.getCursorPosition().row);
    }
  };
}

function outdentSelection(groupId, id, editor) {
  return function () {
    if (editor.getSelectedText()) {
      editor.blockOutdent(editor.getSelectionRange());
    } else {
      editor.blockOutdent(editor.getCursorPosition().row);
    }
  };
}

function findTabTokens(groups, fn) {
  const tabTokens = [];

  _.each(groups, group => {
    _.each(group.tabs, tab => {
      if (fn(tab)) {
        const groupId = group.id,
          tabId = tab.id;

        tabTokens.push({groupId, tabId, tab});
      }
    })
  });

  return tabTokens;
}

function getLastFocusedTabToken(tabTokens) {
  if (tabTokens.length === 0) {
    return null;
  } else if (tabTokens.length === 1) {
    return tabTokens[0];
  }

  let bestTabToken = tabTokens[0],
    bestTabTokenTime = tabTokens[0].tab.lastFocused;

  for (let i = 1; i < tabTokens.length; i++) {
    const tab = tabTokens[i].tab,
      newTime = tab.lastFocused;
    if (bestTabTokenTime < tab.lastFocused) {
      bestTabToken = tabTokens[i];
      bestTabTokenTime = newTime;
    }
  }

  return bestTabToken;
}

function hasCode(text) {
  const hasNewLines = text.indexOf('\n') > -1;


  // If a single line, then has no code if blank line or a comment
  if (!hasNewLines) {
    const trimmedStart = _.trimStart(text);

    if (trimmedStart.length <= 0 || trimmedStart[0] === '#') {
      return false;
    }
  }

  return true;
}

/**
 * Execute some text from an editor in a certain kind of mode
 * @param {ace.Editor} editor
 * @param {string} text
 * @param {string} mode  'python', 'sql', 'sqlserver', 'pgsql', etc.
 * @returns {function}
 */
function executeText(editor, text, mode) {
  return function (dispatch) {
    const hasText = _.trim(text) !== '';

    if (hasText) {
      if (_.includes(pythonTypes, mode)) {
        // todo: find if code is runnable

        // if it starts with #, it's not runnable
        if (hasCode(text)) {
          // find recent python terminal tab
          return applicationControl.surveyTabs().then(function (result) {
            const groups = _.flatten(_.map(result, 'freeTabGroups')),
              isTerminal = tab => _.includes(['document-terminal-viewer', 'block-terminal-viewer'], tab.contentType),
              tabTokens = findTabTokens(groups, isTerminal),
              latestTabToken = getLastFocusedTabToken(tabTokens);

            if (latestTabToken) {
              const terminalTypes = {
                'block-terminal-viewer': blockTerminalViewerActions.execute,
                'document-terminal-viewer': documentTerminalViewerActions.execute
              };

              return dispatch(terminalTypes[latestTabToken.tab.contentType](latestTabToken.groupId, latestTabToken.tabId, {text}));
            }
          });
        }
      } else if (_.includes(sqlTypes, mode)) {
        return freeTabActions.execute({
          text,
          codeType: 'sql',
          isCodeRunnable: true,
          isCodeIsolated: true
        });
      }
    }

    return _.noop;
  };
}

function executeSelection(groupId, id, editor) {
  return function (dispatch, getState) {
    const state = getState(),
      tabContent = commonTabsActions.getContent(state[editorTabGroupName], groupId, id),
      text = getSelectionOrLine(editor);

    dispatch(executeText(editor, text, tabContent.mode));

    // go to next line (even if we have to make a new line)
    forceGoToNextLine(editor);
  };
}

function executeFile(groupId, id, editor) {
  return function (dispatch, getState) {
    const state = getState(),
      tabContent = commonTabsActions.getContent(state[editorTabGroupName], groupId, id),
      text = editor.getValue();

    dispatch(executeText(editor, text, tabContent.mode));
  };
}

export default {
  executeFile,
  executeSelection,
  indentSelection,
  interrupt,
  openPreferences,
  outdentSelection
};
