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

export default {
  createContract,
  createExpand
};
