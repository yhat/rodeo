'use strict';

const _ = require('lodash'),
  outputMap = {};

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function linkRequestToOutput(client, response) {
  const requestMap = client.requestMap;

  if (!_.isString(response.result)) {
    throw new Error('Expected result to be msg_id of a later response');
  }

  if (!_.isString(response.id)) {
    throw new Error('Expected id to be a key referring to an earlier request');
  }

  requestMap[response.id].msg_id = response.result;
  outputMap[response.result] = {id: response.id, msg_id: response.result};
}

/**
 * @param {JupyterClient} client
 * @param {*} message
 */
function requestInputFromUser(client, message) {
  client.emit('input_request', message);
}

function broadcastKernelStatus(client, message) {
  client.emit('status', message.content.execution_state);
}

/**
 * @param {object} request
 * @param {object} result
 */
function resolveRequest(request, result) {
  // payload is deprecated, so don't even expose it
  request.deferred.resolve(_.omit(result.content, 'payload', 'engine_info', 'execution_count'));

  // we're done reporting about this topic
  delete outputMap[request.msg_id];
}


/**
 * @param {{status: string, id: string}} obj
 * @returns {boolean}
 */
function isStartComplete(obj) {
  return obj.status === 'complete' && obj.id === 'startup-complete';
}

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isRequestToOutputLink(client, response) {
  const requestMap = client.requestMap,
    result = response.result;

  return !!(response.id && result && requestMap[response.id]);
}

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isExecutionResult(response) {
  const parentMessageId = _.get(response, 'result.parent_header.msg_id');

  return !!(outputMap[parentMessageId]);
}

/**
 * @param {{id: string}} parent  Original request
 * @param {{msg_type: string}} child  Resulting action
 * @param {JupyterClient} client  Map of all current requests
 * @returns {boolean}
 */
function isRequestResolution(parent, child, client) {
  const requestMap = client.requestMap;
  let request = requestMap[parent.id];

  if (request) {
    if (_.isArray(request.successEvent) && _.includes(request.successEvent, child.msg_type)) {
      return true;
    } else if (request.successEvent === child.msg_type) {
      return true;
    }
  }

  return false;
}

/**
 * @param {string} source
 * @param {{msg_type: string}} child
 * @returns {boolean}
 */
function isInputRequestMessage(source, child) {
  return source === 'stdin' && child.msg_type === 'input_request';
}

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function resolveExecutionResult(client, response) {
  const source = response.source,
    result = response.result,
    outputMapId = _.get(result, 'parent_header.msg_id');

  let parent = outputMap[outputMapId],
    child = _.omit(result, ['msg_id', 'parent_header']);

  child.header = _.omit(child.header, ['version', 'msg_id', 'session', 'username', 'msg_type']);
  if (!parent.header) {
    parent.header = result.parent_header;
  }

  if (isInputRequestMessage(source, child)) {
    requestInputFromUser(client, result);
  } else if (isRequestResolution(parent, child, client)) {
    let requestId = parent.id;

    resolveRequest(client.requestMap[requestId], result);
  } else if (child.msg_type === 'status') {
    broadcastKernelStatus(client, result);
  }
}

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function handle(client, response) {
  if (isStartComplete(response)) {
    client.emit('ready');
  } else if (isRequestToOutputLink(client, response)) {
    linkRequestToOutput(client, response);
  } else if (isExecutionResult(response)) {
    resolveExecutionResult(client, response);
    client.emit(response.source, response);
  } else if (response.result && response.source) {
    client.emit(response.source, response);
  } else if (response.id && response.result === null) {
    // ignore, they didn't give us a msg_id and that's okay
  } else {
    client.emit('error', new Error('Unknown data object: ' + require('util').inspect(response)));
  }
}

function getOutputMap() {
  return _.cloneDeep(outputMap);
}

module.exports.handle = handle;
module.exports.getOutputMap = getOutputMap;
