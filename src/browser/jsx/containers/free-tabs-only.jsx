import _ from 'lodash';
import React from 'react';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';

import FullScreen from '../components/full-screen/full-screen.jsx';
import FreeTabGroup from './free-tab-group/free-tab-group.jsx';
import ModalDialogContainer from '../components/modal-dialog/modal-dialog-container.jsx';
import NotificationsContainer from '../components/notifications/notifications-container.jsx';
import ipcDispatcher from '../services/ipc-dispatcher';
import freeTabGroups from './free-tab-group/free-tab-group.reducer';

function broadcast(state, action) {
  console.log(action.type, action);

  if (!state) {
    return {};
  }

  return state;
}


const rootReducer = combineReducers({
    freeTabGroups,
    broadcast
  }),
  createStoreWithMiddleware = applyMiddleware(thunk)(createStore),
  store = createStoreWithMiddleware(rootReducer);

ipcDispatcher(store.dispatch);

// log every change to the store (this has performance implications, of course).
store.subscribe(_.debounce(() => console.log('store', store.getState()), 500));

/**
 * Expose the global application state/store in two ways:
 * a) connect() from 'react-redux' (i.e. containers)
 * b) this.context.store for components that explictly ask for it (i.e., SplitPane component to broadcast)
 *
 * @class FreeTabsOnly
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'FreeTabsOnly',
  childContextTypes: {
    store: React.PropTypes.object
  },
  getChildContext: function () {
    return {store};
  },
  render: function () {
    return (
      <Provider store={store}>
        <FullScreen row>
          <FreeTabGroup id="only-one" />
          <ModalDialogContainer />
          <NotificationsContainer />
        </FullScreen>
      </Provider>
    );
  }
});
