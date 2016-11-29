'use strict';

import _ from 'lodash';
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

  // they have what they wanted; resolve immediately
  if (request.resolveEvent === 'link' && response.source === 'link') {
    request.deferred.resolve(response.result);
  }

  request.msg_id = response.result;
  outputMap[response.result] = {id: response.id, msg_id: response.result};
}

/**
 * @param {object} request
 * @param {object} result
 */
function resolveRequest(request, result) {
  // execution_count doesn't apply to us
  request.deferred.resolve(result.content);
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
 * @param {{id: string}} outputItem  Original request
 * @param {{msg_type: string}} result  Resulting action
 * @param {JupyterClient} client  Map of all current requests
 * @returns {boolean}
 */
function isRequestResolution(outputItem, result, client) {
  const requestMap = client.requestMap,
    request = requestMap[outputItem.id];

  return !!(request && doesRequestMatchEvent(request.resolveEvent, outputItem, result));
}

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function resolveExecutionResult(client, response) {
  const result = response.result,
    outputMapId = _.get(result, 'parent_header.msg_id');

  let outputItem = outputMap[outputMapId],
    request = client.requestMap[outputItem.id];

  if (isRequestResolution(outputItem, result, client)) {
    resolveRequest(request, result);
  }

  if (!request.hidden) {
    client.emit('jupyter', response);
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
  // client.emit('jupyter', response);

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

function removeOutputEntry(key) {
  if (outputMap[key]) {
    delete outputMap[key];
    return true;
  }
  return false;
}

module.exports.handle = handle;
module.exports.getOutputMap = getOutputMap;
module.exports.resetOutputMap = resetOutputMap;
module.exports.removeOutputEntry = removeOutputEntry;
