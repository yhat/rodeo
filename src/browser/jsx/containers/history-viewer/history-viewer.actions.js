/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {object} block
 * @returns {object}
 */
function addExecutionBlock(groupId, id, block) {
  return {type: 'EXECUTION_BLOCK_ADDED', groupId, id, block};
}

/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {string} blockId
 * @param {object} item
 * @returns {object}
 */
function addExecutionBlockItem(groupId, id, blockId, item) {
  return {type: 'EXECUTION_BLOCK_ITEM_ADDED', groupId, id, blockId, item};
}

function removeExecutionBlock(groupId, id, blockId) {
  return {type: 'EXECUTION_BLOCK_REMOVED', groupId, id, blockId};
}

export default {
  addExecutionBlock,
  addExecutionBlockItem,
  removeExecutionBlock
};
