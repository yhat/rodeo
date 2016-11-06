import _ from 'lodash';
import mapReducers from '../../services/map-reducers';
import reduxUtil from '../../services/redux-util';
import historyViewerReducer from '../history-viewer/history-viewer.reducer';
import promptViewerReducer from '../prompt-viewer/prompt-viewer.reducer';

const prefix = reduxUtil.fromFilenameToPrefix(__filename);

function copyToPrompt(state, action) {
  const payload = action.payload,
    lines = payload.lines;

  // put lines
  return _.assign({}, state, {
    lines,
    cursor: {row: lines.length - 1, column: _.last(lines).length},
    historyIndex: -1
  });
}

function rerunningBlock(state, action) {
  // clear the block's items

  const blockIndex = _.findIndex(state.blocks, {id: action.payload.id}),
    firstInputStreamIndex = _.findIndex(state.blocks[blockIndex].items, {type: 'inputStream'}),
    items = _.clone([state.blocks[blockIndex].items[firstInputStreamIndex]]);

  return state.setIn(['blocks', blockIndex, 'items'], items);
}

function reranBlock(state, action) {
  const blockIndex = _.findIndex(state.blocks, {id: action.payload.blockId});

  return state.setIn(['blocks', blockIndex, 'responseMsgId'], action.payload.responseMsgId);
}

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

    state = state.set('blocks', blocks);
  }

  return state;
}

export default reduxUtil.reduceReducers(
  mapReducers(reduxUtil.addPrefixToKeys(prefix, {
    COPY_TO_PROMPT: copyToPrompt,
    RERUNNING_BLOCK: rerunningBlock,
    RERAN_BLOCK: reranBlock,
    BLOCK_ADDED: blockAdded,
    BLOCK_REMOVED: blockRemoved
  }), {}),
  historyViewerReducer,
  promptViewerReducer
);
