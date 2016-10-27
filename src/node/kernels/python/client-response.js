'use strict';

const _ = require('lodash');
let outputMap = {};

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function linkRequestToOutput(client, response) {
  const requestMap = client.requestMap,
    request = requestMap[response.id];

  if (!_.isString(response.result)) {
    throw new Error('Expected result to be msg_id of a later response');
  }

  if (!_.isString(response.id)) {
    throw new Error('Expected id to be a key referring to an earlier request');
  }

  if (request.resolveEvent === 'link' && response.source === 'link') {
    // they have what they wanted; resolve immediately, do not create outputMap item
    request.deferred.resolve(response.result);
  } else {
    request.msg_id = response.result;
    outputMap[response.result] = {id: response.id, msg_id: response.result};
  }
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
  // execution_count doesn't apply to us
  request.deferred.resolve(result.content);
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
    result = response.result,
    source = response.source;

  return !!(source === 'link' && response.id && result && requestMap[response.id]);
}

/**
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isExecutionResult(response) {
  const parentMessageId = _.get(response, 'result.parent_header.msg_id');

  return !!outputMap[parentMessageId];
}

/**
 * @param {[string] | string | function} event
 * @param {object} parent
 * @param {object} child
 * @returns {boolean}
 */
function doesRequestMatchEvent(event, parent, child) {
  const msgType = child.msg_type;

  return (_.isArray(event) && _.includes(event, msgType) ||
    (_.isFunction(event) && event(parent, child)) ||
    (event === msgType));
}

/**
 * @param {{id: string}} parent  Original request
 * @param {{msg_type: string}} child  Resulting action
 * @param {JupyterClient} client  Map of all current requests
 * @returns {boolean}
 */
function isRequestResolution(parent, child, client) {
  const requestMap = client.requestMap,
    request = requestMap[parent.id];

  return !!(request && doesRequestMatchEvent(request.resolveEvent, parent, child));
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
    child = _.omit(result, ['msg_id', 'parent_header']),
    requestId = parent.id,
    request = client.requestMap[requestId];

  child.header = _.omit(child.header, ['version', 'msg_id', 'session', 'username', 'msg_type']);
  if (!parent.header) {
    parent.header = result.parent_header;
  }

  if (isInputRequestMessage(source, child)) {
    requestInputFromUser(client, result);
  } else if (isRequestResolution(parent, child, client)) {
    resolveRequest(request, result);

  } else if (child.msg_type === 'status') {
    broadcastKernelStatus(client, result);
  }

  if (!request.hidden) {
    client.emit(response.source, response);
  }
}

/**
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isEvalResult(response) {
  const source = response.source;

  return source === 'eval' && _.isString(response.id);
}

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function resolveEvalResult(client, response) {
  const result = response.result,
    request = client.requestMap[response.id];

  // payload is deprecated, so don't even expose it
  request.deferred.resolve(result);
}

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function handle(client, response) {
  client.emit('jupyter', response);

  if (isStartComplete(response)) {
    client.emit('ready');
  } else if (isRequestToOutputLink(client, response)) {
    linkRequestToOutput(client, response);
  } else if (isExecutionResult(response)) {
    resolveExecutionResult(client, response);
  } else if (isEvalResult(response)) {
    resolveEvalResult(client, response);
  } else if (response.result && response.source) {
    client.emit(response.source, response);
  } else if (response.id && response.result === null) {
    // ignore, they didn't give us a msg_id and that's okay
  } else {
    client.emit('error', new Error('Unknown data object: ' + require('util').inspect(response)));
  }
}

/**
 * @returns {object}
 */
function getOutputMap() {
  // outside people are not allowed to modify this
  return _.cloneDeep(outputMap);
}

function resetOutputMap() {
  outputMap = {};
}

module.exports.handle = handle;
module.exports.getOutputMap = getOutputMap;
module.exports.resetOutputMap = resetOutputMap;
