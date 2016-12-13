import _ from 'lodash';
import React from 'react';
import {connect, Provider} from 'react-redux';
import Immutable from 'seamless-immutable';
import cid from '../services/cid';
import FullScreen from '../components/layout-containers/full-screen.jsx';
import FreeTabGroup from './free-tab-group/free-tab-group.jsx';
import ipcDispatcher from '../services/ipc-dispatcher';
import rootReducer from './free-tabs-only.reducer';
import reduxReducer from '../services/redux-store';
import text from './text.yml';

const groupId = cid(),
  store = reduxReducer.create(rootReducer, {freeTabGroups: Immutable([{groupId: groupId, active: '', tabs: []}])}),
  ConnectedFreeTabGroup = connect((state, ownProps) => _.find(state.freeTabGroups, {groupId: ownProps.groupId}))(FreeTabGroup);

ipcDispatcher(store.dispatch);

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
    store: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  getChildContext: function () {
    return {store, text};
  },
  render: function () {
    return (
      <Provider store={store}>
        <FullScreen row>
          <ConnectedFreeTabGroup groupId={groupId} />
        </FullScreen>
      </Provider>
    );
  }
});
