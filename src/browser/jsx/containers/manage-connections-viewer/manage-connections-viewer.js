import React from 'react';
import {connect} from 'react-redux';
import ManageConnections from '../../components/manage-connections/manage-connections';
import actions from './manage-connections.actions';
import definitions from './definitions.yml';
import text from '../text.yml';

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onCancel: id => dispatch(actions.cancel(id)),
    onOK: (id, result) => dispatch(actions.ok(id, result)),
    onAddConnection: () => dispatch(actions.addConnection()),
    onConnect: id => dispatch(actions.connect(id)),
    onDisconnect: id => dispatch(actions.disconnect(id)),
    onRemoveConnection: id => dispatch(actions.removeConnection(id)),
    onChange: change => dispatch(actions.addChange(change)),
    onSelectConnection: id => dispatch(actions.selectConnection(id))
  };
}

export default connect(state => state.manageConnections, mapDispatchToProps)(React.createClass({
  displayName: 'ManageConnectionsViewer',
  render: function () {
    return <ManageConnections definitions={definitions} text={text} {...this.props} />;
  }
}));
