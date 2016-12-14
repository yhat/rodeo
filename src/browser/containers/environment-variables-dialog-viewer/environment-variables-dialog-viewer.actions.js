import reduxUtil from '../../services/redux-util';

const prefix = reduxUtil.fromFilenameToPrefix(__filename);

function cancelChanges() {
  return {type: prefix + 'CANCEL_CHANGES'};
}

function saveChanges() {
  return {type: prefix + 'SAVE_CHANGES'};
}

function startEdit(item, container) {
  return {type: prefix + 'START_EDIT', payload: {item, container}};
}

function saveEdit(payload) {
  return {type: prefix + 'SAVE_EDIT', payload};
}

function cancelEdit(payload) {
  return {type: prefix + 'CANCEL_EDIT', payload};
}

function changeEditValue(item, target, value) {
  return {type: prefix + 'CHANGE_EDIT_VALUE', payload: {item, target, value}};
}

function reload() {
  return {type: prefix + 'RELOAD'};
}

function removeKey(item, key) {
  return {type: prefix + 'REMOVE_KEY', payload: {item, key}};
}

export default {
  cancelChanges,
  saveChanges,
  startEdit,
  saveEdit,
  cancelEdit,
  changeEditValue,
  reload,
  removeKey
};
