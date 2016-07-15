/* globals describe, it */
import { expect } from 'chai';
import lib from '../../../src/browser/jsx/services/map-reducers';
import sinon from 'sinon';

describe(__filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('returns initial state when not given state', function () {
    const reducerMap = {},
      initialState = {a: 'b'},
      state = undefined,
      action = {};

    expect(lib(reducerMap, initialState)(state, action)).to.equal(initialState);
  });

  it('runs function matching action', function () {
    const spy = sinon.spy(),
      reducerMap = {a: spy},
      initialState = {},
      state = {},
      action = {type: 'a'};

    lib(reducerMap, initialState)(state, action);

    sinon.assert.calledWith(spy, state, action);
  });
});
