import _ from 'lodash';
import cid from '../services/cid';
import freeTabGroupActions from '../containers/free-tab-group/free-tab-group.actions';
import databaseConnectionService from '../services/database-connections';

function connect(payload) {
  return function (dispatch) {
    dispatch({type: 'DATABASE_CONNECTION_CONNECTING', payload});
    return databaseConnectionService.connect(payload)
      .then(() => dispatch({type: 'DATABASE_CONNECTION_CONNECTED', payload}))
      .then(() => dispatch(freeTabGroupActions.guaranteeTab('database-viewer')))
      .catch(error => dispatch({type: 'DATABASE_CONNECTION_CONNECTED', payload: error, error: true}));
  };
}

function query(payload) {
  return function (dispatch) {
    const queryId = cid();

    dispatch({type: 'DATABASE_CONNECTION_QUERYING', queryId, payload});
    return databaseConnectionService.query(payload)
      .then(result => dispatch({type: 'DATABASE_CONNECTION_QUERIED', queryId, payload: result}))
      .catch(error => dispatch({type: 'DATABASE_CONNECTION_QUERIED', queryId, payload: error, error: true}));
  };
}

function disconnect(payload) {
  return function (dispatch) {
    dispatch({type: 'DATABASE_CONNECTION_DISCONNECTING', payload});
    return databaseConnectionService.disconnect(payload)
      .then(result => dispatch({type: 'DATABASE_CONNECTION_DISCONNECTED', payload: result}))
      .catch(error => dispatch({type: 'DATABASE_CONNECTION_DISCONNECTED', payload: error, error: true}));
  };
}

export default {
  connect,
  query,
  disconnect
};
