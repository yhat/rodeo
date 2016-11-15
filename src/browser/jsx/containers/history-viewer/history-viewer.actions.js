import reduxUtil from '../../services/redux-util';

// Don't share with other windows
// Setting this means these actions will not be broadcast
const sender = 'self',
  prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function createExpand(groupId, id, blockId, itemId) {
  return {type: prefixType + 'EXPAND', groupId, id, payload: {blockId, itemId}, meta: {sender}};
}

function createContract(groupId, id, blockId, itemId) {
  return {type: prefixType + 'CONTRACT', groupId, id, payload: {blockId, itemId}, meta: {sender}};
}

/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {object} block
 * @returns {object}
 */
function createBlockAdd(groupId, id, block) {
  return {type: prefixType + 'BLOCK_ADDED', groupId, id, block};
}

/**
 * An execution context block contains a series of content related to some execution of code in some context
 * @param {string} groupId
 * @param {string} id
 * @param {string} blockId
 * @returns {object}
 */
function createBlockRemove(groupId, id, blockId) {
  return {type: prefixType + 'BLOCK_REMOVED', groupId, id, blockId};
}

export default {
  createContract,
  createExpand,
  createBlockAdd,
  createBlockRemove
};
