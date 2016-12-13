import React from 'react';
import SetupViewer from './setup-viewer/setup-viewer.jsx';
import {Provider} from 'react-redux';
import FullScreen from '../components/layout-containers/full-screen.jsx';
import rootReducer from './startup.reducer';
import reduxStore from '../services/redux-store';
import ipcDispatcher from '../services/ipc-dispatcher';
import text from './startup-text.yml';

const store = reduxStore.create(rootReducer);

ipcDispatcher(store.dispatch);

/**
 * @class Startup
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'Startup',
  childContextTypes: {
    store: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  getChildContext: function () {
    return {store, text};
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
