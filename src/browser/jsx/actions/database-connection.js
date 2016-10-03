import api from '../services/api';

function connect(connectionConfig) {
  return function (dispatch) {
    dispatch({type: 'DATABASE_CONNECTION_CONNECTING', connectionConfig});
    return api.send('databaseConnect', connectionConfig)
      .then(function () {
        return dispatch({type: 'DATABASE_CONNECTION_CHANGED', id: connectionConfig.id, connected: true});
      })
      .then(function () {

      })
      .catch(function (error) {
        return dispatch({type: 'DATABASE_CONNECTION_ERROR', error});
      });
  };
}

function disconnect() {
  return function (dispatch) {
    dispatch({type: 'DATABASE_CONNECTION_DISCONNECTING'});
    return api.send('databaseDisconnect')
      .then(function () {
        return dispatch({type: 'DATABASE_CONNECTION_CHANGED', connected: false});
      })
      .catch(function (error) {
        return dispatch({type: 'DATABASE_CONNECTION_ERROR', error});
      });
  };
}

export default {
  connect,
  disconnect
};
