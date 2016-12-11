import React from 'react';
import commonReact from '../../services/common-react';
import {connect} from 'react-redux';
import actions from './environment-variables-dialog-viewer.actions';
import {createSelector} from 'reselect';
import {local} from '../../services/store';

const askQuitSelector = createSelector(state => state, () => ({
  askQuit: local.get('askQuit') || true
}));

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onAddStart: () => dispatch(actions.startAdd),
    onAddSave: () => dispatch(actions.saveAdd),
    onAddCancel: () => dispatch(actions.cancelAdd),
    onChangesCancel: () => dispatch(actions.cancelChanges),
    onChangesSave: () => dispatch(actions.saveChanges),
    onEditStart: () => dispatch(actions.startEdit),
    onEditSave: () => dispatch(actions.saveEdit),
    onEditCancel: () => dispatch(actions.cancelEdit)
  };
}

export default connect(askQuitSelector, mapDispatchToProps)(React.createClass({
  displayName: 'AskQuitDialogViewer',
  propTypes: {
    onOK: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render() {
    return <EnvironmentVariablesDialog {...this.props}/>;
  }
}));
