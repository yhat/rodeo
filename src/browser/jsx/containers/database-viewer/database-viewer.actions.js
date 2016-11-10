import _ from 'lodash';
import cid from '../../services/cid';
import api from '../../services/api';

function normalizeItemForTreeView(item) {
  item.cid = cid();

  if (item.items) {
    item.items = _.map(item.items, item => normalizeItemForTreeView(item));
  }

  if (item.isTable) {
    item.icon = 'table';
    item.expandable = true;
  } else {
    delete item.icon;
  }

  return item;
}

function expandItem(groupId, id, itemPath) {
  return {type: 'DATABASE_VIEWER_ITEM_EXPANDED', groupId, id, itemPath};
}

function contractItem(groupId, id, itemPath) {
  return {type: 'DATABASE_VIEWER_ITEM_CONTRACTED', groupId, id, itemPath};
}

function refreshItems(groupId, id) {
  return function (dispatch, getState) {
    const state = getState(),
      manageConnections = state.manageConnections,
      connectedId = manageConnections && manageConnections.connected;

    if (_.isString(connectedId)) {
      dispatch({type: 'DATABASE_VIEWER_REFRESHING', groupId, id})
      return api.send('databaseInfo', connectedId)
        .then(info => {
          info.items = _.map(info.items, item => normalizeItemForTreeView(item));

          return info;
        })
        .then(payload => dispatch({type: 'DATABASE_VIEWER_REFRESHED', groupId, id, payload}))
        .catch(error => dispatch({type: 'DATABASE_VIEWER_REFRESHED', groupId, id, payload: error, error: true}));
    }
  };
}

function openItem(groupId, id, item) {
  return function () {
    // do nothing for now
    console.log(__filename, 'openItem', {groupId, id, item});
  };
}

export default {
  refreshItems,
  expandItem,
  contractItem,
  openItem
};
