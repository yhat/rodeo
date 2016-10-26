import kernel from '../../actions/kernel';

function execute(groupId, id, context) {
  return function (dispatch) {
    console.log('execute', context);
    const text = context.lines.join('\n');

    // pause prompt
    dispatch({type: 'PROMPT_STATE_CHANGED', groupId, id, state: 'paused'});

    return dispatch(kernel.execute(text)).then(function (result) {
      console.log('YAY!', result);
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
