import _ from 'lodash';
import jupyterHistory from '../../services/jupyter/history';
import mapReducers from '../../services/map-reducers';
import immutableUtil from '../../services/immutable-util';
import errorsService from '../../services/errors';
import cid from '../../services/cid';
import textUtil from '../../services/text-util';
import reduxUtil from '../../services/redux-util';

const prefix = reduxUtil.fromFilenameToPrefix(__filename);

/**
 * If any of the history blocks are jupyterResponse types, then they might need to be updated with new content
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function jupyterResponseDetected(state, action) {
  const responseMsgId = _.get(action, 'payload.result.parent_header.msg_id'),
    blockIndex = _.findIndex(state.blocks, {responseMsgId});

  if (blockIndex > -1) {
    state = state.updateIn(['blocks', blockIndex], container => {
      return jupyterHistory.applyResponse(container, action.payload);
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

function databaseConnectionQuerying(state, action) {
  const id = action.queryId,
    blockIndex = _.findIndex(state.blocks, {id});

  if (blockIndex === -1) {
    state = immutableUtil.pushAtPath(state, ['blocks'], {
      id,
      hasVisibleContent: true,
      type: 'postgresqlResponse',
      items: [{
        type: 'input',
        lines: action.payload.text.split('\n')
      }]
    });
  }

  return state;
}

function addHTMLTable(data, result) {
  const headers = '<tr>' + _.map(result.columns, column => '<th>' + column.name + '</th>').join('\n') + '</tr>',
    rows = _.map(_.take(result.rows, 10), row => {
      return '<tr>' + _.map(row, cellContent => {
        return '<td>' + cellContent + '</td>';
      }).join('') + '</tr>';
    }).join('\n');

  data['text/html'] = '<table border="1" class="dataframe">' + headers + rows + '</table>';

  return data;
}

function addPlainTextTable(data, result) {
  let headers = _.map(result.columns, 'name'),
    rows = [headers].concat(_.take(result.rows, 100)),
    pivot = _.zip.apply(_, rows),
    columnWidths = _.map(pivot, textUtil.longestLength),
    textTable = _.map(rows, row => _.map(row, (cellContent, columnIndex) => textUtil.padRight(cellContent, columnWidths[columnIndex])));

  data['text/plain'] = textTable.join('\n');
}

function convertPostgresqlResult(result) {
  const data = {};

  addHTMLTable(data, result);
  addPlainTextTable(data, result);

  return data;
}

function databaseConnectionQueried(state, action) {
  const id = action.queryId,
    payload = action.payload,
    blockIndex = _.findIndex(state.blocks, {id});

  if (blockIndex > -1) {
    const itemId = cid();

    if (action.error) {
      const type = 'error',
        error = errorsService.toObject(payload);

      state = immutableUtil.pushAtPath(state, ['blocks', blockIndex, 'items'], _.assign({id: itemId, type}, error));
    } else {
      const type = 'result',
        data = convertPostgresqlResult(payload);

      state = immutableUtil.pushAtPath(state, ['blocks', blockIndex, 'items'], {id: itemId, type, data});
    }
  }

  return state;
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

export default mapReducers(_.assign(reduxUtil.addPrefixToKeys(prefix, {
  CONTRACT: contract,
  EXPAND: expand,
  BLOCK_ADDED: blockAdded,
  BLOCK_REMOVED: blockRemoved
}), {
  JUPYTER_RESPONSE: jupyterResponseDetected,
  DATABASE_CONNECTION_QUERYING: databaseConnectionQuerying,
  DATABASE_CONNECTION_QUERIED: databaseConnectionQueried
}), {});
