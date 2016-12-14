import React from 'react';
import {connect} from 'react-redux';
import ModalDialogContainer from '../../components/dialogs/modal-dialog-container';
import actions from './modal-dialog.actions';
import commonReact from '../../services/common-react';

function mapStateToProps(state) {
  return state.modalDialogs;
}

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

export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'ModalDialogViewer',
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    return <ModalDialogContainer {...this.props} />;
  }
}));
