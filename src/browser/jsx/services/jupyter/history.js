import _ from 'lodash';
import cid from '../cid';
import AsciiToHtml from 'ansi-to-html';

const asciiToHtmlConvertor = new AsciiToHtml(),
  blockFactories = {
    display_data: createDisplayData,
    status: createStatusChange,
    error: createError,
    execute_input: createInputStream,
    execute_result: createExecutionResult,
    execute_reply: createExecutionReply,
    stream: createTextStream,
    unknown: createUnknownContent
  };

function createUnknownContent(blocks, response) {
  let buffer = _.get(response, 'result.content');

  if (_.isObject(buffer)) {
    blocks = _.clone(blocks);
    buffer = JSON.stringify(buffer);
    blocks = blocks.concat([{id: cid(), chunks: [{id: cid(), buffer}], type: 'textStream'}]);
  }

  return blocks;
}

function createTextStream(blocks, response) {
  let chunks,
    source = _.get(response, 'result.content.name'),
    text = _.get(response, 'result.content.text');

  if (text) {
    blocks = _.clone(blocks);
    chunks = text.split('\n').map((buffer, index, list) => {
      if (list.length - 1 !== index) {
        buffer += '\n';
      }

      return ({id: cid(), buffer, source});
    });
    blocks = blocks.concat([{id: cid(), chunks, type: 'textStream'}]);
    blocks = mergeTextStreamBlocks(blocks);
  }

  return blocks;
}

function createError(blocks, response) {
  let name = _.get(response, 'result.content.ename'),
    value = _.get(response, 'result.content.evalue'),
    traceback = _.get(response, 'result.content.traceback'),
    oldError = _.find(blocks, block => isResponseBlockErrorEqual(response, block));

  // only report if error isn't already reported
  if (!oldError && traceback) {
    blocks = _.clone(blocks);
    const stacktrace = traceback.map(line => asciiToHtmlConvertor.toHtml(line));

    blocks = blocks.concat([{id: cid(), name, value, stacktrace, traceback, type: 'pythonError'}]);
  }

  return blocks;
}

function createStatusChange(blocks, response) {
  let executionState = _.get(response, 'result.content.execution_state');

  if (_.isString(executionState)) {
    blocks = _.clone(blocks);
    blocks = blocks.concat([{id: cid(), executionState, type: 'statusChange'}]);
  }

  return blocks;
}

function createInputStream(blocks, response) {
  const lines = _.get(response, 'result.content.code').split('\n'),
    executionCount = _.get(response, 'result.content.execution_count'),
    oldInput = _.find(blocks, block => block.type === 'inputStream');

  // only add if we don't already have this type; only one allowed
  if (!oldInput && lines) {
    blocks = _.clone(blocks);

    blocks = blocks.concat([{id: cid(), lines, executionCount, type: 'inputStream', language: 'python'}]);
  }

  return blocks;
}

function createDisplayData(blocks, response) {
  const data = _.get(response, 'result.content.data');

  if (_.isObject(data)) {
    if (data['image/png']) {
      blocks = _.clone(blocks);
      const href = data['image/png'],
        alt = data['text/plain'];

      blocks = blocks.concat([{id: cid(), href, alt, type: 'image'}]);
    }
  }

  return blocks;
}

function createExecutionResult(blocks, response) {
  const data = _.get(response, 'result.content.data');

  if (_.isObject(data)) {
    if (!(data['text/plain'] && _.startsWith(data['text/plain'], '<ggplot:'))) {
      blocks = _.clone(blocks);
      blocks = blocks.concat([{id: cid(), data, type: 'executionResult'}]);
    }
  }

  return blocks;
}

function isResponseBlockErrorEqual(response, block) {
  const name = _.get(response, 'result.content.ename'),
    value = _.get(response, 'result.content.evalue'),
    traceback = _.get(response, 'result.content.traceback');

  return block.type === 'pythonError' &&
    block.name === name &&
    block.value === value &&
    _.isEqual(block.traceback, traceback);
}

function createExecutionReply(blocks, response) {
  const status = _.get(response, 'result.content.status');

  if (status === 'error') {
    blocks = createError(blocks, response);
  } else if (status === 'ok') {
    blocks = _.clone(blocks);
    blocks = blocks.concat([{type: 'executionReplyOK'}]);
  } else {
    blocks = createUnknownContent(blocks, response);
  }

  return blocks;
}

/**
 * Needs to be able to handle Immutable blocks too
 * Try to clone responsibly, please
 * @param {Array} blocks
 * @returns {Array}
 */
function mergeTextStreamBlocks(blocks) {
  const firstIndex = _.findIndex(blocks, {type: 'textStream'});

  if (firstIndex !== -1) {
    blocks = _.clone(blocks);
    const firstBlock = _.clone(blocks[firstIndex]),
      removedBlocks = _.remove(blocks, (block, index) => index !== firstIndex && block.type === 'textStream'),
      firstChunks = firstBlock.chunks;

    firstBlock.chunks = firstChunks.concat.apply(firstChunks, _.map(removedBlocks, 'chunks'));
    blocks[firstIndex] = firstBlock;
  }

  return blocks;
}

function applyResponse(blocks, response) {
  const type = _.get(response, 'result.msg_type');

  return blockFactories[type] ? blockFactories[type](blocks, response) : blockFactories['unknown'](blocks, response);
}

export default {
  applyResponse
};
