import _ from 'lodash';
import api from '../../services/api';
import kernel from '../../actions/kernel';
import reduxUtil from '../../services/redux-util';
import commonTabsActions from '../../services/common-tabs-actions';
import client from '../../services/jupyter/client';
import {local} from '../../services/store';

const prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function copyAnnotation(groupId, id) {
  return {type: 'DOCUMENT_TERMINAL_VIEWER_COPY_ANNOTATION', groupId, id};
}

function execute(groupId, id, context) {
  return function (dispatch) {
    dispatch({type: prefixType + 'EXECUTING', groupId, id});
    return dispatch(kernel.execute(context.text)).then(function (responseMsgId) {
      return dispatch({type: prefixType + 'EXECUTED', groupId, id, payload: responseMsgId});
    }).catch(error => console.error(error));
  };
}

function input(groupId, id, context) {
  return function (dispatch) {
    dispatch({type: prefixType + 'INPUTTING', groupId, id});
    return dispatch(kernel.input(context.text)).then(function (responseMsgId) {
      return dispatch({type: prefixType + 'INPUTTED', groupId, id, payload: responseMsgId});
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
        return dispatch(execute(groupId, id, {text: `cd "${result}"`}));
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

function autocomplete(groupId, id, payload) {
  return {type: prefixType + 'AUTOCOMPLETE', groupId, id, payload, meta: {sender: 'self'}};
}

export default {
  autocomplete,
  clear,
  copyAnnotation,
  execute,
  input,
  interrupt,
  showSelectWorkingDirectoryDialog,
  restart
};
