import reduxUtil from '../../services/redux-util';

const prefix = reduxUtil.fromFilenameToPrefix(__filename);

function focus(groupId, id, plot) {
  return {type: prefix + 'FOCUS_PLOT', groupId, id, plot};
}

function remove(groupId, id, plot) {
  return {type: prefix + 'REMOVE_PLOT', groupId, id, plot};
}

export default {
  focus,
  remove
};
