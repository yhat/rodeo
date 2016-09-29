import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import PreferencesList from '../../components/preferences/preferences-list.jsx';
import actions from './preferences-viewer.actions';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  return state.preferences;
}

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
    onSelectFile: change => dispatch(actions.selectFile(change)),
    onSelectFolder: change => dispatch(actions.selectFolder(change)),
    onManageConnections: () => dispatch(actions.manageConnections())
  };
}

function getChange(item, event) {
  const value = item.type === 'checkbox' ? event.target.checked : event.target.value,
    type = item.type,
    key = item.key;

  return {key, value, type};
}

/**
 * @class PreferencesViewer
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
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
      <PreferencesList
        {...props}
        onChange={this.handleChange}
        onOK={this.handleOK}
        onSelectFile={this.handleSelectFile}
        onSelectFolder={this.handleSelectFolder}
      />
    );
  }
}));
