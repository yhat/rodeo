/**
 * @param {object} reducerMap
 * @param {*} initialState
 * @returns {function}
 */
export default function (reducerMap, initialState) {
  return function (state, action) {
    if (!state) {
      state = initialState;
    }

    if (reducerMap[action.type]) {
      return reducerMap[action.type](state, action) || state;
    } else {
      return state;
    }
  };
}
