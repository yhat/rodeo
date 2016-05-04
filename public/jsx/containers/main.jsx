import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import cid from '../services/cid';
import StudioLayout from '../components/studio-layout.jsx';
import * as ipc from '../services/ipc';
import rootReducer from '../reducers';
import { showSaveFileDialog, showOpenFileDialog, saveActiveFile } from '../actions/file';
import { quit, toggleDevTools, checkForUpdates } from '../actions/application';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore),
  store = createStoreWithMiddleware(rootReducer);

ipc.on('dispatch', function (event, action) {
  console.log('event dispatched', action);
  const dispatch = store.dispatch;

  switch (action.type) {
    case 'CHECK_FOR_UPDATES': return dispatch(checkForUpdates);
    case 'TOGGLE_DEV_TOOLS': return dispatch(quit);
    case 'QUIT': return dispatch(toggleDevTools);
    case 'SAVE_ACTIVE_FILE': return dispatch(saveActiveFile);
    case 'SHOW_SAVE_FILE_DIALOG': return dispatch(showSaveFileDialog);
    case 'SHOW_OPEN_FILE_DIALOG': return dispatch(showOpenFileDialog);
    default: return dispatch(action);
  }
});

store.subscribe(() => console.log('store', store.getState()) );


export default React.createClass({
  displayName: 'Main',
  childContextTypes: {
    store: React.PropTypes.object
  },
  getChildContext: function () {
    return { store };
  },
  render: function () {
    return (
      <Provider store={store}>
        <StudioLayout />
      </Provider>
    );
  }
});