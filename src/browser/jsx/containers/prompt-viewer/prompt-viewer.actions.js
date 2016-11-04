import reduxUtil from '../../services/redux-util';

// Don't share with other windows
// Setting this means these actions will not be broadcast
const sender = 'self',
  prefixType = reduxUtil.fromFilenameToPrefix(__filename);

function autocomplete(groupId, id, payload) {
  return {type: prefixType + 'AUTOCOMPLETE', groupId, id, payload, meta: {sender}};
}

function createCommand(groupId, id, payload) {
  return {type: prefixType + 'COMMAND', groupId, id, payload, meta: {sender}};
}

function copyToPrompt(groupId, id, payload) {
  return {type: prefixType + 'COPY_TO_PROMPT', groupId, id, payload, meta: {sender}};
}

export default {
  autocomplete,
  createCommand,
  copyToPrompt
};
