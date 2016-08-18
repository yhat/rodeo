import React from 'react';
import SetupViewer from './setup-viewer/setup-viewer.jsx';
import {Provider} from 'react-redux';
import FullScreen from '../components/full-screen/full-screen.jsx';
import rootReducer from './startup.reducer';
import reduxStore from '../services/redux-store';

const store = reduxStore.create(rootReducer);

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
