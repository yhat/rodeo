import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import PreferencesList from '../../components/preferences/preferences-list.jsx';
import preferenceActions from './preferences.actions';

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
    onChange: change => dispatch(preferenceActions.add(change)),
    onTabClick: active => dispatch(preferenceActions.selectTab(active)),
    onSave: () => dispatch(preferenceActions.save()),
    onApply: () => dispatch(preferenceActions.save()),
    onCancel: () => dispatch(preferenceActions.cancelAll())
  };
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
   * Remember change.
   * @param {object} item
   * @param {string} item.key
   * @param {Event} event
   */
  handleChange: function (item, event) {
    const props = this.props;
    let value = item.type === 'checkbox' ? event.target.checked : event.target.value,
      type = item.type,
      key = item.key;

    props.onChange({key, value, type});
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

    return <PreferencesList {...props} onChange={this.handleChange} onOK={this.handleOK} />;
  }
}));
