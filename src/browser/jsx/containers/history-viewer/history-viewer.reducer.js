import _ from 'lodash';
import Immutable from 'seamless-immutable';
import jupyterHistory from '../../services/jupyter/history';
import mapReducers from '../../services/map-reducers';

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function blockAdded(state, action) {
  const blockIndex = _.findIndex(state.blocks, {id: action.block.id});

  if (blockIndex === -1) {
    state = state.set('blocks', state.blocks.concat([action.block]));
  }

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function blockRemoved(state, action) {
  const blockIndex = _.findIndex(state.blocks, {id: action.blockId});

  if (blockIndex > -1) {
    let blocks = state.blocks.asMutable();

    blocks.splice(blockIndex, 1);

    state = state.set('blocks', Immutable(blocks));
  }

  return state;
}

/**
 * If any of the history blocks are jupyterResponse types, then they might need to be updated with new content
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function jupyterResponseDetected(state, action) {
  const responseMsgId = _.get(action, 'response.result.parent_header.msg_id'),
    blockIndex = _.findIndex(state.blocks, {responseMsgId});

  if (blockIndex > -1) {
    state = state.updateIn(['blocks', blockIndex, 'items'], items => {
      return Immutable(jupyterHistory.applyResponse(items, action.response));
    });
  }

  return state;
}

function contract(state, action) {
  const blockIndex = _.findIndex(state.blocks, {id: action.payload.blockId});

  if (blockIndex > -1) {
    const itemIndex = _.findIndex(state.blocks[blockIndex].items, {id: action.payload.itemId});

    if (itemIndex > -1) {
      state = state.setIn(['blocks', blockIndex, 'items', itemIndex, 'expanded'], false);
    }
  }

  return state;
}

function expand(state, action) {
  const blockIndex = _.findIndex(state.blocks, {id: action.payload.blockId});

  if (blockIndex > -1) {
    const itemIndex = _.findIndex(state.blocks[blockIndex].items, {id: action.payload.itemId});

    if (itemIndex > -1) {
      state = state.setIn(['blocks', blockIndex, 'items', itemIndex, 'expanded'], true);
    }
  }

  return state;
}

export default mapReducers({
  HISTORY_VIEWER_CONTRACT: contract,
  HISTORY_VIEWER_EXPAND: expand,
  TERMINAL_VIEWER_BLOCK_ADDED: blockAdded,
  TERMINAL_VIEWER_BLOCK_REMOVED: blockRemoved,
  JUPYTER_RESPONSE: jupyterResponseDetected
}, {});
