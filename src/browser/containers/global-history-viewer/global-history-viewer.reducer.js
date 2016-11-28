import _ from 'lodash';
import mapReducers from '../../services/map-reducers';
import historyViewerReducer from '../history-viewer/history-viewer.reducer';
import cid from '../../services/cid';
import reduxUtil from '../../services/redux-util';

const maxBlockHistory = 15;

/**
 * @param {Array} state
 * @param {string} responseMsgId
 * @returns {Array}
 */
function appendEmptyJupyterResponseBlock(state, responseMsgId) {
  const type = 'jupyterResponse';

  return state.set('blocks', state.blocks.concat([{id: cid(), responseMsgId, type, items: []}]));
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function changePreference(state, action) {
  switch (action.change.key) {
    case 'fontSize': return state.set('fontSize', _.toNumber(action.change.value));
    default: return state;
  }
}

/**
 * If any of the history blocks are jupyterResponse types, then they might need to be updated with new content
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function jupyterResponseDetected(state, action) {
  const responseMsgId = _.get(action, 'payload.result.parent_header.msg_id');

  if (responseMsgId) {
    let blockIndex = _.findIndex(state.blocks, {responseMsgId});

    if (blockIndex === -1) {
      state = appendEmptyJupyterResponseBlock(state, responseMsgId);
    }

    if (state.blocks.length > maxBlockHistory) {
      state = state.set('blocks', _.tail(state.blocks));
    }
  }

  return state;
}

export default reduxUtil.reduceReducers(mapReducers({
  PREFERENCE_CHANGE_SAVED: changePreference,
  JUPYTER_RESPONSE: jupyterResponseDetected
}, {}), historyViewerReducer);
