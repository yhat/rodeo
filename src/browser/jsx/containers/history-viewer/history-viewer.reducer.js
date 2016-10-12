import _ from 'lodash';
import Immutable from 'seamless-immutable';
import commonTabsReducers from '../../services/common-tabs-reducers';

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function executionBlockAdded(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'history-viewer', (tab, cursor) => {
    state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], content => {
      const block = action.block,
        blockIndex = _.findIndex(content.blocks, {id: action.block.id});

      if (blockIndex === -1) {
        block.items = block.item || [];

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
function executionBlockItemAdded(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'history-viewer', (tab, cursor) => {
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

function executionBlockRemoved(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'history-viewer', (tab, cursor) => {
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

export default {
  EXECUTION_BLOCK_ADDED: executionBlockAdded,
  EXECUTION_BLOCK_ITEM_ADDED: executionBlockItemAdded,
  EXECUTION_BLOCK_REMOVED: executionBlockRemoved
};
