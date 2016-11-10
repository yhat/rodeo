import _ from 'lodash';
import databaseConnectionActions from '../../actions/database-connection';
import definitions from './definitions.yml';

function selectConnection(payload) {
  return {type: 'MANAGE_CONNECTIONS_SELECT_CONNECTION', payload};
}

function addChange(payload) {
  return {type: 'MANAGE_CONNECTIONS_ADD_CHANGE', payload};
}

function addConnection() {
  return {type: 'MANAGE_CONNECTIONS_ADD_CONNECTION'};
}

function removeConnection(payload) {
  return {type: 'MANAGE_CONNECTIONS_REMOVE_CONNECTION', payload};
}

function connect(id) {
  return function (dispatch, getState) {
    const state = getState(),
      proposedConnectionConfig = _.find(state.manageConnections.list, {id});

    if (proposedConnectionConfig) {
      const definition = _.find(definitions.types, {name: proposedConnectionConfig.type}),
        allowedOptions = ['id', 'type'].concat(Object.keys(definition.knownConfigurationOptions));

      if (definition) {
        const connectionConfig = _.defaults(_.pick(proposedConnectionConfig, allowedOptions), definition.defaults);

        return dispatch(databaseConnectionActions.connect(connectionConfig));
      }
    }
  };
}

function disconnect(id) {
  return function (dispatch) {
    return dispatch(databaseConnectionActions.disconnect({id}));
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
