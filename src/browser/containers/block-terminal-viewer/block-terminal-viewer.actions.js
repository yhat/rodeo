import _ from 'lodash';
import cid from '../../services/cid';
import kernel from '../../actions/kernel';
import reduxUtil from '../../services/redux-util';
import historyViewerActions from '../history-viewer/history-viewer.actions';

const prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function execute(groupId, id, context) {
  return function (dispatch) {
    dispatch({type: prefixType + 'EXECUTING', groupId, id});
    return dispatch(kernel.execute(context.text)).then(function (responseMsgId) {
      const type = 'jupyterResponse',
        items = [];

      dispatch(historyViewerActions.createBlockAdd(groupId, id, {id: cid(), responseMsgId, type, items}));
      return dispatch({type: prefixType + 'EXECUTED', groupId, id});
    }).catch(error => dispatch({type: prefixType + 'EXECUTED', groupId, id, payload: error, error: true}));
  };
}

function input(groupId, id, context) {
  return function (dispatch) {

    dispatch({type: prefixType + 'INPUTTING', groupId, id});
    return dispatch(kernel.input(context.text)).then(function (payload) {
      return dispatch({type: prefixType + 'INPUTTED', groupId, id, payload});
    }).catch(error => dispatch({type: prefixType + 'INPUTTED', groupId, id, payload: error, error: true}));
  };
}

function installPythonModule(groupId, id, name, version) {
  return function (dispatch) {
    const text = version ? `! pip install ${name}==${version}` : `! pip install ${name}`;

    return dispatch(kernel.execute(text)).then(function (responseMsgId) {
      const type = 'jupyterResponse',
        items = [];

      return dispatch(historyViewerActions.createBlockAdd(groupId, id, {id: cid(), responseMsgId, type, items}));
    }).catch(error => console.error(error));
  };
}

function reRunHistoryBlock(groupId, id, block) {
  return function (dispatch) {
    dispatch({type: prefixType + 'RERUNNING_BLOCK', groupId, id, payload: block});
    const inputBlock = block && _.find(block.items, {type: 'inputStream'}),
      lines = inputBlock && inputBlock.lines,
      text = lines && lines.join('\n');

    if (text) {
      return dispatch(kernel.execute(text)).then(function (responseMsgId) {
        return dispatch({type: prefixType + 'RERAN_BLOCK', groupId, id, payload: {responseMsgId, blockId: block.id}});
      }).catch(error => dispatch({type: prefixType + 'RERAN_BLOCK', groupId, id, payload: error, error: true}));
    }
  };
}

export default {
  execute,
  input,
  installPythonModule,
  reRunHistoryBlock
};
