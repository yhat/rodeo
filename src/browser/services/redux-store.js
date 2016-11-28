import _ from 'lodash';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reactPerformance from './react-performance';

/**
 * @param {object} reducer
 * @param {object} [initialState]
 * @returns {*}
 */
function create(reducer, initialState) {
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore),
    store = createStoreWithMiddleware(reducer, initialState);

  // log every change to the store (this has performance implications, of course).
  store.subscribe(_.debounce(() => {
    reactPerformance.report();
    console.log('store', store.getState());
  }, 500));

  return store;
}

export default {
  create
};
