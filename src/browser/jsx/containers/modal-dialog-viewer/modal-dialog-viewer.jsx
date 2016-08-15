import React from 'react';
import {connect} from 'react-redux';
import ModalDialogContainer from '../../components/modal-dialog/modal-dialog-container.jsx';
import actions from './modal-dialog.actions';

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onCancel: id => dispatch(actions.cancel(id)),
    onCancelAll: () => dispatch(actions.cancelAll()),
    onOK: (id, result) => dispatch(actions.ok(id, result)),
    onRegister: () => dispatch(actions.register())
  };
}

/**
 * @class ModalDialogViewer
 */
export default connect(state => state, mapDispatchToProps)(React.createClass({
  displayName: 'ModalDialogViewer',
  propTypes: {
    modalDialogs: React.PropTypes.array,
    onCancel: React.PropTypes.func.isRequired,
    onCancelAll: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired,
    onRegister: React.PropTypes.func.isRequired
  },
  render: function () {
    return <ModalDialogContainer {...this.props} />;
  }
}));
