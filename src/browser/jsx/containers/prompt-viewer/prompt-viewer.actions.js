import _ from 'lodash';
import cid from '../../services/cid';
import kernel from '../../actions/kernel';
import historyViewerActions from '../history-viewer/history-viewer.actions';

function execute(groupId, id, context) {
  return function (dispatch) {
    const text = context.lines.join('\n');

    // pause prompt
    dispatch({type: 'PROMPT_STATE_CHANGED', groupId, id, state: 'paused'});
    return dispatch(kernel.execute(text)).then(function (executionDetails) {
      const request = executionDetails.request,
        response = executionDetails.response;

      console.log('YAY!', executionDetails);
      dispatch(historyViewerActions.addHistoryBlock(groupId, id, {
        id: cid(),
        responseMsgId: _.get(response, 'result.parent_header.msg_id'),
        type: 'jupyterResponse',
        items: _.filter(_.map(request.unmatchedResponses, response => {
          const id = cid();
          let buffer = _.get(response, 'result.content');

          if (_.isObject(buffer)) {
            buffer = JSON.stringify(buffer);

            return {
              id: cid(),
              chunks: [{id, buffer}],
              type: 'textStream'
            };
          }
        }), item => !!item && !!item.type)
      }));
      return dispatch({type: 'PROMPT_STATE_CHANGED', groupId, id, state: 'prompt'});
    }).catch(function (error) {
      console.error(error);
      return dispatch({type: 'PROMPT_STATE_CHANGED', groupId, id, state: 'prompt'});
    });
  };
}

export default {
  execute
};
