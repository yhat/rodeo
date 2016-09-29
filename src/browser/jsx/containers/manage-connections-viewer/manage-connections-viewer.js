import React from 'react';
import {connect} from 'react-redux';
import ModalDialogContainer from '../../components/modal-dialog/modal-dialog-container.jsx';
import actions from './manage-connections.actions';

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onCancel: id => dispatch(actions.cancel(id)),
    onOK: (id, result) => dispatch(actions.ok(id, result))
  };
}

export default connect(state => state, mapDispatchToProps)(React.createClass({
  displayName: 'ManageConnectionsViewer',
  render: function () {
    return <ModalDialogContainer {...this.props} />;
  }
}));
