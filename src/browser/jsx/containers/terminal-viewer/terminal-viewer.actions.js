import _ from 'lodash';
import cid from '../../services/cid';
import kernel from '../../actions/kernel';
import reduxUtil from '../../services/redux-util';

const prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function execute(groupId, id, context) {
  return function (dispatch) {
    const text = context.lines.join('\n');

    // pause prompt
    return dispatch(kernel.execute(text)).then(function (responseMsgId) {
      const type = 'jupyterResponse',
        items = [];

      return dispatch(addHistoryBlock(groupId, id, {id: cid(), responseMsgId, type, items}));
    }).catch(error => console.error(error));
  };
}

/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {object} block
 * @returns {object}
 */
function addHistoryBlock(groupId, id, block) {
  return {type: prefixType + 'BLOCK_ADDED', groupId, id, block};
}

/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {string} blockId
 * @returns {object}
 */
function removeHistoryBlock(groupId, id, blockId) {
  return {type: prefixType + 'BLOCK_REMOVED', groupId, id, blockId};
}

function installPythonModule(groupId, id, pythonModuleName) {
  return function (dispatch) {
    const text = `! pip install ${pythonModuleName}`;

    return dispatch(kernel.execute(text)).then(function (responseMsgId) {
      const type = 'jupyterResponse',
        items = [];

      return dispatch(addHistoryBlock(groupId, id, {id: cid(), responseMsgId, type, items}));
    }).catch(error => console.error(error));
  };
}

function copyToPrompt(groupId, id, props) {
  return {type: prefixType + 'COPY_TO_PROMPT', groupId, id, payload: props};
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
      }).catch(error => console.error(error));
    }
  };
}

export default {
  addHistoryBlock,
  copyToPrompt,
  installPythonModule,
  reRunHistoryBlock,
  removeHistoryBlock,
  execute
};
