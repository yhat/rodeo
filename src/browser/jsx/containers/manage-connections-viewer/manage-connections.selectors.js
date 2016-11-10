import _ from 'lodash';
import {createSelector} from 'reselect';

const getConnectionConfig = state => state.manageConnections,
  getConnection = createSelector(
    getConnectionConfig,
    config => _.find(config.list, {id: config.connected})
  );

export default {
  getConnection
};
