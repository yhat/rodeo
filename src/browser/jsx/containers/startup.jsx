import React from 'react';
import SetupViewer from './setup-viewer/setup-viewer.jsx';
import {Provider} from 'react-redux';
import FullScreen from '../components/full-screen/full-screen.jsx';
import kernelActions from '../actions/kernel';
import rootReducer from './startup.reducer';
import reduxStore from '../services/redux-store';
import './startup.css';

const store = reduxStore.create(rootReducer);

store.dispatch(kernelActions.detectKernel());

/**
 * @class Startup
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'Startup',
  getInitialState: function () {
    const store = reduxStore.create(rootReducer);

    store.dispatch(kernelActions.detectKernel());

    return {store};
  },
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
