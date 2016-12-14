import React from 'react';
import commonReact from '../../services/common-react';
import {connect} from 'react-redux';
import actions from './environment-variables-dialog-viewer.actions';
import EnvironmentVariablesDialog from '../../components/dialogs/environment-variables-dialog';
import selectors from './environment-variables-dialog-viewer.selectors';
import './environment-variables-dialog-viewer.css';

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onCancel: () => dispatch(actions.cancelChanges()),
    onApply: () => dispatch(actions.saveChanges()),
    onEditStart: (item, container) => dispatch(actions.startEdit(item, container)),
    onEditSave: item => dispatch(actions.saveEdit(item)),
    onEditCancel: item => dispatch(actions.cancelEdit(item)),
    onEditValueChange: (item, target, value) => dispatch(actions.changeEditValue(item, target, value)),
    onReload: () => dispatch(actions.reload()),
    onRemoveKey: (item, key) => dispatch(actions.removeKey(item, key))
  };
}

export default connect(selectors.getEnvironmentVariablesViewer, mapDispatchToProps)(React.createClass({
  displayName: 'EnvironmentVariablesDialogViewer',
  propTypes: {
    onOK: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleEditValueChange(item, target, event) {
    const value = event.target.value;

    this.props.onEditValueChange(item, target, value);
  },
  render() {
    return <EnvironmentVariablesDialog {...this.props} onEditValueChange={this.handleEditValueChange}/>;
  }
}));
