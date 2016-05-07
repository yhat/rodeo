/**
 * @param {object} reducerMap
 * @param {*} initialState
 * @returns {function}
 */
export default function (reducerMap, initialState) {
  return function (state, action) {
    console.log('ace-pane reducer', state, action);
    if (!state) {
      state = initialState;
    }

    if (reducerMap[action.type]) {
      console.log('ace-pane reducer', 'changed state');
      return reducerMap[action.type](state, action) || state;
    } else {
      console.log('ace-pane reducer', 'unchanged state');
      return state;
    }
  };
}
