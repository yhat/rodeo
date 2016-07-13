import _ from 'lodash';
import React from 'react';
import SetupViewer from './setup-viewer/setup-viewer.jsx';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import FullScreen from '../components/full-screen/full-screen.jsx';
import kernelActions from '../actions/kernel';
import rootReducer from './startup.reducer';
import './startup.css';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore),
  store = createStoreWithMiddleware(rootReducer);

store.dispatch(kernelActions.detectKernel());

// log every change to the store (this has performance implications, of course).
store.subscribe(_.debounce(() => console.log('store', store.getState()), 500));

/**
 * @class Startup
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'Startup',
  render: function () {
    return (
      <Provider store={store}>
        <FullScreen>
          <SetupViewer />
        </FullScreen>
      </Provider>
    );
  }
});
