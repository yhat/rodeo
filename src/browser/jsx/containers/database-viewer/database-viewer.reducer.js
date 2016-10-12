import Immutable from 'seamless-immutable';
import commonTabsReducers from '../../services/common-tabs-reducers';

function refreshed(state, action) {
  const info = action.info;

  if (info && info.items) {
    commonTabsReducers.eachTabByActionAndContentType(state, action, 'database-viewer', (tab, cursor) => {
      state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], obj => obj.set('items', info.items));
    });
  }

  return state;
}

function itemExpanded(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'database-viewer', (tab, cursor) => {
    const indexPath = action.itemPath && commonTabsReducers.convertItemPathToIndexPath(tab.content.items, action.itemPath);

    if (indexPath) {
      indexPath.unshift('items');
      state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'].concat(indexPath), item => {
        return item.set('expanded', true);
      });
    }
  });

  return state;
}

function itemContracted(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'database-viewer', (tab, cursor) => {
    const indexPath = action.itemPath && commonTabsReducers.convertItemPathToIndexPath(tab.content.items, action.itemPath);

    if (indexPath) {
      indexPath.unshift('items');
      state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'].concat(indexPath), item => {
        return item.set('expanded', false);
      });
    }
  });

  return state;
}

export default {
  DATABASE_VIEWER_ITEM_EXPANDED: itemExpanded,
  DATABASE_VIEWER_ITEM_CONTRACTED: itemContracted,
  DATABASE_VIEWER_REFRESHED: refreshed
};
