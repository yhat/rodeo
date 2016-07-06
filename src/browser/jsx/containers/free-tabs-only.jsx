import _ from 'lodash';
import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';

import cid from '../services/cid';
import FullScreen from '../components/full-screen/full-screen.jsx';
import FreeTabGroup from './free-tab-group/free-tab-group.jsx';
import ipcDispatcher from '../services/ipc-dispatcher';
import rootReducer from './free-tabs-only.reducer';

const groupId = cid(),
  createStoreWithMiddleware = applyMiddleware(thunk)(createStore),
  store = createStoreWithMiddleware(rootReducer, {freeTabGroups: [{groupId: groupId, items: []}]});

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
          <FreeTabGroup id={groupId} />
        </FullScreen>
      </Provider>
    );
  }
});
