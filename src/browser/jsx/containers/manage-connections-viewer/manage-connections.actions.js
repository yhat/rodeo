import _ from 'lodash';
import databaseConnectionActions from '../../actions/database-connection';
import definitions from './definitions.yml';

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

function connect(id) {
  return function (dispatch, getState) {
    const state = getState(),
      connectionConfig = _.find(state.manageConnections.list, {id});

    if (connectionConfig) {
      const definition = _.find(definitions.types, {name: connectionConfig.type}),
        allowedOptions = ['id', 'type'].concat(Object.keys(definition.knownConfigurationOptions));

      if (definition) {
        const options = _.defaults(_.pick(connectionConfig, allowedOptions), definition.defaults);

        return dispatch(databaseConnectionActions.connect(options));
      }
    }
  };
}

function disconnect() {
  return function (dispatch) {
    return dispatch(databaseConnectionActions.disconnect());
  };
}

export default {
  addChange,
  addConnection,
  connect,
  disconnect,
  removeConnection,
  selectConnection
};
