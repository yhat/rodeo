import _ from 'lodash';
import cid from '../cid';
import textUtil from '../text-util';

const itemFactories = {
    display_data: createDisplayData,
    status: createStatusChange,
    error: createError,
    execute_input: createInputStream,
    execute_result: createExecutionResult,
    execute_reply: createExecutionReply,
    stream: createTextStream,
    unknown: createUnknownContent
  };

function createUnknownContent(container, response) {
  let buffer = _.get(response, 'result.content');

  if (_.isObject(buffer)) {
    container = _.clone(container);
    let items = _.clone(container.items);

    container.hasVisibleContent = true;
    buffer = JSON.stringify(buffer);
    items = items.concat([{id: cid(), chunks: [{id: cid(), buffer}], type: 'textStream'}]);
    container.items = items;
  }

  return container;
}

function createTextStream(container, response) {
  let chunks,
    source = _.get(response, 'result.content.name'),
    text = _.get(response, 'result.content.text');

  if (text) {
    container = _.clone(container);
    let items = _.clone(container.items);

    container.hasVisibleContent = true;
    chunks = text.split('\n').filter(_.identity).map((buffer, index, list) => {
      if (list.length - 1 !== index) {
        buffer += '\n';
      }

      return ({id: cid(), buffer, source});
    });
    items = items.concat([{id: cid(), chunks, type: 'textStream'}]);
    items = mergeTextStreamItems(items);
    container.items = items;
  }

  return container;
}

function createError(container, response) {
  let name = _.get(response, 'result.content.ename'),
    value = _.get(response, 'result.content.evalue'),
    traceback = _.get(response, 'result.content.traceback'),
    oldError = _.find(container.items, item => isResponseBlockErrorEqual(response, item));

  // only report if error isn't already reported
  if (!oldError && traceback) {
    container = _.clone(container);
    let items = _.clone(container.items);
    const converter = textUtil.getAsciiToHtmlStream(),
      stacktrace = traceback.map(line => converter.toHtml(line));

    container.hasVisibleContent = true;
    items = items.concat([{id: cid(), name, value, stacktrace, traceback, type: 'pythonError'}]);
    container.items = items;
  }

  return container;
}

function createStatusChange(container, response) {
  let executionState = _.get(response, 'result.content.execution_state');

  if (_.isString(executionState)) {
    container = _.clone(container);
    let items = _.clone(container.items);

    items = items.concat([{id: cid(), executionState, type: 'statusChange'}]);
    container.items = items;
  }

  return container;
}

function createInputStream(container, response) {
  const lines = _.get(response, 'result.content.code').split('\n'),
    executionCount = _.get(response, 'result.content.execution_count'),
    oldInput = _.find(container.items, item => item.type === 'inputStream');

  // only add if we don't already have this type; only one allowed
  if (!oldInput && lines) {
    container = _.clone(container);
    let items = _.clone(container.items);

    container.hasVisibleContent = true;
    items = items.concat([{id: cid(), lines, executionCount, type: 'inputStream', language: 'python'}]);
    container.items = items;
  }

  return container;
}

function createDisplayData(container, response) {
  const data = _.get(response, 'result.content.data');

  if (_.isObject(data)) {
    if (data['image/png']) {
      container = _.clone(container);
      let items = _.clone(container.items),
        href = data['image/png'],
        alt = data['text/plain'];

      container.hasVisibleContent = true;
      items = items.concat([{id: cid(), href, alt, type: 'image'}]);
      container.items = items;
    }
  }

  return container;
}

function createExecutionResult(container, response) {
  const data = _.get(response, 'result.content.data');

  if (_.isObject(data)) {
    if (!(data['text/plain'] && _.startsWith(data['text/plain'], '<ggplot:'))) {
      container = _.clone(container);
      let items = _.clone(container.items);

      items = items.concat([{id: cid(), data, type: 'executionResult'}]);
      container.items = items;
    }
  }

  return container;
}

function isResponseBlockErrorEqual(response, item) {
  const name = _.get(response, 'result.content.ename'),
    value = _.get(response, 'result.content.evalue'),
    traceback = _.get(response, 'result.content.traceback');

  return item.type === 'pythonError' &&
    item.name === name &&
    item.value === value &&
    _.isEqual(item.traceback, traceback);
}

function createExecutionReply(container, response) {
  const status = _.get(response, 'result.content.status');

  if (status === 'error') {
    container = createError(container, response);
  } else if (status === 'ok') {
    container = _.clone(container);
    let items = _.clone(container.items);

    items = items.concat([{type: 'executionReplyOK'}]);

    container.items = items;
  } else {
    container = createUnknownContent(container, response);
  }

  return container;
}

/**
 * Needs to be able to handle Immutable items too
 * Try to clone responsibly, please
 * @param {Array} items
 * @returns {Array}
 */
function mergeTextStreamItems(items) {
  const firstIndex = _.findIndex(items, {type: 'textStream'});

  if (firstIndex !== -1) {
    items = _.clone(items);
    const firstItem = _.clone(items[firstIndex]),
      removedItems = _.remove(items, (item, index) => index !== firstIndex && item.type === 'textStream'),
      firstChunks = firstItem.chunks;

    firstItem.chunks = firstChunks.concat.apply(firstChunks, _.map(removedItems, 'chunks'));
    items[firstIndex] = firstItem;
  }

  return items;
}

function applyResponse(container, response) {
  const type = _.get(response, 'result.msg_type');

  return itemFactories[type] ? itemFactories[type](container, response) : itemFactories['unknown'](container, response);
}

export default {
  applyResponse
};
