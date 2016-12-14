import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedFormListDialog from '../../components/tabbed-form-list-dialog/tabbed-form-list-dialog.js';
import actions from './preferences-viewer.actions';
import modalDialogActions from '../modal-dialog-viewer/modal-dialog.actions';
import selectors from './preferences-viewer.selectors';

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onChange: change => dispatch(actions.add(change)),
    onTabClick: active => dispatch(actions.selectTab(active)),
    onSave: () => dispatch(actions.save()),
    onApply: () => dispatch(actions.save()),
    onCancel: () => dispatch(actions.cancelAll()),
    onContainerValueChange: change => dispatch(actions.changeContainerValue(change)),
    onSelectFile: change => dispatch(actions.selectFile(change)),
    onSelectFolder: change => dispatch(actions.selectFolder(change)),
    onOpenDialog: (item, dialogName) => dispatch(modalDialogActions.add(dialogName))
  };
}

function getChange(item, event) {
  const value = item.type === 'checkbox' ? event.target.checked : event.target.value,
    type = item.type,
    key = item.key;

  return {key, value, type};
}

export default connect(selectors.getPreferencesViewer, mapDispatchToProps)(React.createClass({
  displayName: 'PreferencesViewer',
  propTypes: {
    // expected to be provided from parent
    onOK: React.PropTypes.func.isRequired
  },
  /**
   * @param {object} item
   * @param {string} item.key
   * @param {Event} event
   */
  handleChange: function (item, event) {
    this.props.onChange(getChange(item, event));
  },

  handleContainerValueChange: function (item, propertyName, event) {
    const value = event.target.value,
      key = item.key;

    this.props.onContainerValueChange({key, value, propertyName});
  },
  /**
   * @param {object} item
   * @param {string} item.key
   * @param {Event} event
   */
  handleSelectFile: function (item, event) {
    this.props.onSelectFile(getChange(item, event));
  },
  /**
   * @param {object} item
   * @param {string} item.key
   * @param {Event} event
   */
  handleSelectFolder: function (item, event) {
    this.props.onSelectFolder(getChange(item, event));
  },
  /**
   * Save the changed keys, close.
   */
  handleOK: function () {
    const props = this.props;

    if (_.size(props.changes) === 0) {
      // they made no changes, close
      props.onOK();
    } else {
      // same as saving and then closing
      if (props.canSave) {
        props.onSave();
        props.onOK();
      }
    }
  },

  render: function () {
    const props = this.props;

    return (
      <TabbedFormListDialog
        {...props}
        onChange={this.handleChange}
        onContainerValueChange={this.handleContainerValueChange}
        onOK={this.handleOK}
        onSelectFile={this.handleSelectFile}
        onSelectFolder={this.handleSelectFolder}
      />
    );
  }
}));
