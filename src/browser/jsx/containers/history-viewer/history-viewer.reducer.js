import _ from 'lodash';
import Immutable from 'seamless-immutable';
import commonTabsReducers from '../../services/common-tabs-reducers';
import jupyterHistory from '../../services/jupyter/history';

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function blockAdded(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'terminal-viewer', (tab, cursor) => {
    state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], content => {
      const blockIndex = _.findIndex(content.blocks, {id: action.block.id});

      if (blockIndex === -1) {
        content = content.set('blocks', content.blocks.concat([action.block]));
      }

      return content;
    });
  });

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function blockItemAdded(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'terminal-viewer', (tab, cursor) => {
    const content = tab.content,
      blockIndex = _.findIndex(content.blocks, {id: action.blockId});

    if (blockIndex > -1) {
      state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content', 'blocks', blockIndex], block => {
        return block.set('items', block.items.concat([action.item]));
      });
    }
  });

  return state;
}

function blockRemoved(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'terminal-viewer', (tab, cursor) => {
    state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], content => {
      const blockIndex = _.findIndex(content.blocks, {id: action.block.id});

      if (blockIndex > -1) {
        let blocks = content.blocks.asMutable();

        blocks.splice(blockIndex, 1);

        content = content.set('blocks', Immutable(blocks));
      }

      return content;
    });
  });

  return state;
}

/**
 * If any of the history blocks are jupyterResponse types, then they might need to be updated with new content
 * @param {object} state
 * @param {object} action
 * @returns {object}
 */
function jupyterResponseDetected(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'terminal-viewer', (tab, cursor) => {
    const responseMsgId = _.get(action, 'response.result.parent_header.msg_id'),
      blockIndex = _.findIndex(tab.content.blocks, {responseMsgId});

    if (blockIndex > -1) {
      state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content', 'blocks', blockIndex, 'items'], items => {
        return Immutable(items.concat([jupyterHistory.responseToHistoryBlockItem(action.response)]));
      });
    }
  });

  return state;
}

export default {
  HISTORY_VIEWER_BLOCK_ADDED: blockAdded,
  HISTORY_VIEWER_BLOCK_ITEM_ADDED: blockItemAdded,
  HISTORY_VIEWER_BLOCK_REMOVED: blockRemoved,
  JUPYTER_RESPONSE: jupyterResponseDetected
};
