import _ from 'lodash';

/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {object} block
 * @returns {object}
 */
function addHistoryBlock(groupId, id, block) {
  return {type: 'HISTORY_VIEWER_BLOCK_ADDED', groupId, id, block};
}

/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {string} blockId
 * @param {object} item
 * @returns {object}
 */
function addHistoryBlockItem(groupId, id, blockId, item) {
  return {type: 'HISTORY_VIEWER_BLOCK_ITEM_ADDED', groupId, id, blockId, item};
}

function removeHistoryBlock(groupId, id, blockId) {
  return {type: 'EXECUTION_BLOCK_REMOVED', groupId, id, blockId};
}

export default {
  addHistoryBlock,
  addHistoryBlockItem,
  removeHistoryBlock
};
