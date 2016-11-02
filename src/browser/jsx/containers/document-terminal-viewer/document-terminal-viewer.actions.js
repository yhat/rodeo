import _ from 'lodash';
import api from '../../services/api';
import kernel from '../../actions/kernel';
import reduxUtil from '../../services/redux-util';
import commonTabsActions from '../../services/common-tabs-actions';
import client from '../../services/jupyter/client';

const prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function copyAnnotation(groupId, id, event) {
  return {type: 'DOCUMENT_TERMINAL_VIEWER_COPY_ANNOTATION', groupId, id};
}

/**
 * An execution is an id
 * @param {string} groupId
 * @param {string} id
 * @param {string} responseMsgId
 * @returns {object}
 */
function addResponse(groupId, id, responseMsgId) {
  return {type: prefixType + 'RESPONSE_ADDED', groupId, id, payload: responseMsgId};
}

function execute(groupId, id, context) {
  return function (dispatch) {
    const text = context.lines.join('\n');

    return dispatch(kernel.execute(text)).then(function (responseMsgId) {
      return dispatch(addResponse(groupId, id, responseMsgId));
    }).catch(error => console.error(error));
  };
}

function restart(groupId, id) {
  return function (dispatch) {
    dispatch({type: prefixType + 'RESTARTING', groupId, id});

    client.restartInstance()
      .then(() => dispatch({type: prefixType + 'RESTARTED', groupId, id}))
      .catch(error => dispatch({type: prefixType + 'RESTARTED', groupId, id, payload: error, error: true}));
  };
}

function showSelectWorkingDirectoryDialog(groupId, id) {
  return function (dispatch, getState) {
    const state = getState(),
      content = commonTabsActions.getContent(state.freeTabGroups, groupId, id);

    return api.send('openDialog', {
      title: 'Select a folder',
      defaultPath: content.cwd || local.get('workingDirectory'),
      properties: ['openDirectory']
    }).then(function (result) {
      if (_.isArray(result) && result.length > 0) {
        result = result[0];
      }

      if (_.isString(result)) {
        return dispatch(execute(groupId, id, {lines: [`cd "${result}"`]}));
      }
    }).catch(error => console.error(error));
  };
}

function interrupt(groupId, id) {
  return function (dispatch) {
    dispatch({type: prefixType + 'INTERRUPTING', groupId, id});

    client.interrupt()
      .then(() => dispatch({type: prefixType + 'INTERRUPTING', groupId, id}))
      .catch(error => dispatch({type: prefixType + 'INTERRUPTING', groupId, id, payload: error, error: true}));
  };
}

function clear(groupId, id) {
  return {type: prefixType + 'CLEAR', groupId, id};
}

export default {
  clear,
  copyAnnotation,
  execute,
  interrupt,
  showSelectWorkingDirectoryDialog,
  restart
}
