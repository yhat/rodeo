/* globals describe, it, expect, jest */

import lib from './map-reducers';

describe(__filename, function () {

  it('returns initial state when not given state', function () {
    const reducerMap = {},
      initialState = {a: 'b'},
      state = undefined,
      action = {};

    expect(lib(reducerMap, initialState)(state, action)).toEqual(initialState);
  });

  it('runs function matching action', function () {
    const spy = jest.fn(),
      reducerMap = {a: spy},
      initialState = {},
      state = {},
      action = {type: 'a'};

    lib(reducerMap, initialState)(state, action);

    expect(spy).toBeCalledWith(state, action);
  });
});
