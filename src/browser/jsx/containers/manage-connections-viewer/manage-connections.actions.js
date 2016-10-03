function selectConnection(active) {
  return {type: 'MANAGE_CONNECTIONS_SELECT_CONNECTION', active};
}

function addChange(change) {
  return {type: 'MANAGE_CONNECTIONS_ADD_CHANGE', change};
}

function addConnection() {
  return {type: 'MANAGE_CONNECTIONS_ADD_CONNECTION'};
}

function removeConnection(id) {
  return {type: 'MANAGE_CONNECTIONS_REMOVE_CONNECTION', id};
}

export default {
  addChange,
  addConnection,
  removeConnection,
  selectConnection
};
