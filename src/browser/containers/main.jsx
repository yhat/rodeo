import _ from 'lodash';
import React from 'react';
import Immutable from 'seamless-immutable';
import {Provider} from 'react-redux';
import client from '../services/jupyter/client';
import FullScreen from '../components/layout-containers/full-screen.jsx';
import StudioLayout from './studio-layout/studio-layout.jsx';
import Sidebar from '../components/sidebar/sidebar.jsx';
import ModalDialogViewer from './modal-dialog-viewer/modal-dialog-viewer.jsx';
import {getInitialState as getModalDialogsInitialState} from './modal-dialog-viewer/modal-dialog.reducer';
import NotificationsContainer from '../components/notifications/notifications-container.jsx';
import rootReducer from './main.reducer';
import initialState from './main.initial';
import ipcDispatcher from '../services/ipc-dispatcher';
import dialogActions from '../actions/dialogs';
import applicationControl from '../services/application-control';
import reduxStore from '../services/redux-store';
import {local} from '../services/store';
import text from './text.yml';

function clearPlots(state) {
  const groups = state.freeTabGroups;

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const tabs = groups[groupIndex].tabs;

    for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
      const tab = tabs[tabIndex];

      if (tab.contentType === 'plot-viewer') {
        tab.content.plots = [];
      }
    }
  }
}

function clearModalDialogs(state) {
  state.modalDialogs = getModalDialogsInitialState();
}

/**
 * React is funny.  If someone calls React.render, the order of componentWillMount and getChildContext and render
 * changes, but we need this value in all places.
 *
 * @function
 * @returns {object}
 */
const getStore = _.once(function createStore() {
// take the state from what we're already been given, or start fresh with initialState
  const lastSavedAppState = local.get('lastSavedAppState');
  let store, state;

  if (lastSavedAppState) {
    // plots are temp files, so they can't be restored
    clearPlots(lastSavedAppState);
    clearModalDialogs(lastSavedAppState);

    state = _.mapValues(lastSavedAppState, value => Immutable(value));
  } else {
    state = window.__PRELOADED_STATE__ || initialState.getState();
  }
  store = reduxStore.create(rootReducer, state);

  ipcDispatcher(store.dispatch);

  return store;
});

/**
 * Expose the global application state/store in two ways:
 * a) connect() from 'react-redux' (i.e. containers)
 * b) this.context.store for components that explictly ask for it (i.e., SplitPane component to broadcast)
 */
export default React.createClass({
  displayName: 'Main',
  childContextTypes: {
    store: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  getChildContext() {
    return {store: getStore(), text};
  },
  componentDidMount() {
    const store = getStore();

    // find the kernel immediately
    store.dispatch(dialogActions.showRegisterRodeo());

    // no visual for this please
    if (local.get('enableAutoupdate') !== false) {
      applicationControl.checkForUpdates();
    }

    // try and start an instance of the python client
    client.guaranteeInstance();
  },
  render() {
    return (
      <Provider store={getStore()}>
        <FullScreen row>
          <StudioLayout />
          <Sidebar />
          <ModalDialogViewer />
          <NotificationsContainer />
        </FullScreen>
      </Provider>
    );
  }
});
