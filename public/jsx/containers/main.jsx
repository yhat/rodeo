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
import * as iopubActions from '../actions/iopub';

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

ipc.on('shell', function (event, data) {
  const result = data.result;

  if (result) {
    switch (result.msg_type) {
      case 'execute_reply': return console.log('shell', result.msg_type, result.content.status);
      default: return console.log('shell', result, {event, data});
    }
  } else {
    console.log('shell', {event, data});
  }
});

ipc.on('iopub', function (event, data) {
  const result = data.result,
    dispatch = store.dispatch;

  if (result) {
    switch (result.msg_type) {
      case 'status': return dispatch(iopubActions.setTerminalState(result.content.execution_state));
      case 'execute_input': return dispatch(iopubActions.addTerminalExecutedInput(result.content.code));
      case 'stream': return dispatch(iopubActions.addTerminalText(result.content.name, result.content.text));
      case 'display_data': return dispatch(iopubActions.addDisplayData(result.content.data));
      default: return console.log('iopub', result, {event, data});
    }
  } else {
    console.log('iopub', {event, data});
  }
});

ipc.on('stdin', function (event, data) {
  const result = data.result;

  if (result) {
    switch (result.msg_type) {
      default: return console.log('stdin', result, {event, data});
    }
  } else {
    console.log('stdin', {event, data});
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