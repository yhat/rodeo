import React from 'react';
import {connect} from 'react-redux';
import AskQuit from '../../components/modal-dialog/dialogs/ask-quit';
import applicationActions from '../../actions/application';

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onQuit: () => dispatch(applicationActions.quit())
  };
}

export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'ModalDialogViewer',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired
  },
  render: function () {
    return <AskQuit {...this.props} />;
  }
}));
