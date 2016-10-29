import _ from 'lodash';
import cid from '../../services/cid';
import kernel from '../../actions/kernel';

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
  return {type: 'TERMINAL_VIEWER_BLOCK_ADDED', groupId, id, block};
}

/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {string} blockId
 * @returns {object}
 */
function removeHistoryBlock(groupId, id, blockId) {
  return {type: 'TERMINAL_VIEWER_BLOCK_REMOVED', groupId, id, blockId};
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

function getHistoryBlock(state, groupId, id, blockId) {

}

function setPrompt(groupId, id, prompt) {
  return {type: 'TERMINAL_VIEWER_SET_PROMPT', groupId, id, prompt};
}

function copyToPrompt(groupId, id, blockId) {
  return function (dispatch, getState) {
    const state = getState(),
      block = getHistoryBlock(state, groupId, id, blockId),
      inputBlock = block && _.find(block.items, {type: 'inputStream'}),
      lines = inputBlock.lines || [''],
      language = inputBlock.language || 'python';

    if (inputBlock) {
      dispatch(setPrompt(groupId, id, {lines, language}));
    }
  };
}

function reRunHistoryBlock(groupId, id, blockId) {
  return function (dispatch, getState) {
    const state = getState(),
      block = getHistoryBlock(state, groupId, id, blockId),
      inputBlock = block && _.find(block.items, {type: 'inputStream'}),
      lines = inputBlock.lines || [''],
      language = inputBlock.language || 'python';

    if (inputBlock) {
      dispatch(execute(groupId, id, {lines, language}));
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
