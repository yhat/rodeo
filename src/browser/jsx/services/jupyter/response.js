import _ from 'lodash';

const requests = {}; // track requests so we can resolve their promises later

/**
 * @param {function} dispatch
 * @param {JupyterClientResponse} response
 */
function handle(dispatch, response) {
  let msg_id = _.get(response, 'result.parent_header.msg_id'),
    request = requests[msg_id];

  if (request) {
    if (request.resolveEvent === _.get(response, 'result.msg_type')) {
      request.deferred.resolve({request, response});
      delete requests[msg_id];
    } else {
      request.unmatchedResponses = request.unmatchedResponses || [];
      request.unmatchedResponses.push(response);
    }
  } else {
    return dispatch({type: 'JUPYTER_RESPONSE', payload: response});
  }
}

/**
 * Add a request to be responded to.
 *
 * @param {string} id
 * @param {object} request
 */
function addRequest(id, request) {
  requests[id] = request;
}

export default {
  handle,
  addRequest
};
