import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import FullScreen from '../components/full-screen/full-screen.jsx';
import StudioLayout from './studio-layout/studio-layout.jsx';
import ModalDialogContainer from '../components/modal-dialog/modal-dialog-container.jsx';
import * as ipc from '../services/ipc';
import rootReducer from '../reducers';
import acePaneActions from '../components/ace-pane/ace-pane.actions';
import applicationActions from '../actions/application';
import dialogActions from '../actions/dialogs';
import * as iopubActions from '../actions/iopub';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore),
  store = createStoreWithMiddleware(rootReducer);

/**
 * The node process will always forward events to the UI here to give a chance to respond to them.
 *
 * An application like this should be UI-driven, so even if the
 * node process could do something on its own, it _shouldn't_.
 */
ipc.on('dispatch', function (event, action) {
  console.log('event dispatched', action);
  const dispatch = store.dispatch,
    dispatchMap = {
      SHOW_ABOUT_RODEO: dialogActions.showAboutRodeo(),
      SHOW_ABOUT_STICKER: dialogActions.showAboutStickers(),
      SHOW_PREFERENCES: dialogActions.showPreferences(),
      CHECK_FOR_UPDATES: applicationActions.checkForUpdates(),
      TOGGLE_DEV_TOOLS: applicationActions.toggleDevTools(),
      QUIT: applicationActions.quit(),
      SAVE_ACTIVE_FILE: acePaneActions.saveActiveFile(),
      SHOW_SAVE_FILE_DIALOG: acePaneActions.showSaveFileDialogForActiveFile(),
      SHOW_OPEN_FILE_DIALOG: acePaneActions.showOpenFileDialogForActiveFile()
    };

  if (dispatchMap[action.type]) {
    return dispatch(dispatchMap[action.type]);
  } else {
    return dispatch(action);
  }
});

ipc.on('shell', function (event, data) {
  const result = data.result;

  if (result) {
    switch (result.msg_type) {
      case 'execute_reply':
        return console.log('shell', result.msg_type, result.content.status);
      default:
        return console.log('shell', result, {event, data});
    }
  } else {
    console.log('shell', {event, data});
  }
});

/**
 * Jupyter sends IOPUB events to broadcast to every client connected to a session.  Various components may be
 * listening and reacting to these independently, without connection to each other.
 */
ipc.on('iopub', function (event, data) {
  const result = data.result,
    dispatch = store.dispatch;

  if (result) {
    switch (result.msg_type) {
      case 'status':
        return dispatch(iopubActions.setTerminalState(result.content.execution_state));
      case 'execute_input':
        return dispatch(iopubActions.addTerminalExecutedInput(result.content.code));
      case 'stream':
        return dispatch(iopubActions.addTerminalText(result.content.name, result.content.text));
      case 'display_data':
        return dispatch(iopubActions.addDisplayData(result.content.data));
      default:
        return console.log('iopub', result, {event, data});
    }
  } else {
    console.log('iopub', {event, data});
  }
});

ipc.on('stdin', function (event, data) {
  const result = data.result;

  if (result) {
    switch (result.msg_type) {
      default:
        return console.log('stdin', result, {event, data});
    }
  } else {
    console.log('stdin', {event, data});
  }
});

/**
 * Log every change to the store (this has performance implications, of course).
 */
store.subscribe(() => console.log('store', store.getState()));

/**
 * Expose the global application state/store in two ways:
 * a) connect() from 'react-redux' (i.e. containers)
 * b) this.context.store for components that explictly ask for it (i.e., SplitPane component to broadcast)
 *
 * @class Main
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'Main',
  childContextTypes: {
    store: React.PropTypes.object
  },
  getChildContext: function () {
    return {store};
  },
  render: function () {
    return (
      <Provider store={store}>
        <FullScreen>
          <StudioLayout />
          <ModalDialogContainer />
        </FullScreen>
      </Provider>
    );
  }
});
