import React from 'react';
import commonReact from '../../services/common-react';
import {connect} from 'react-redux';
import AskQuit from '../../components/modal-dialog/dialogs/ask-quit';
import applicationActions from '../../actions/application';
import actions from '../../actions/preferences';
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
    onAskQuitChange: changes => dispatch(actions.savePreferenceChanges(changes)),
    onQuit: () => dispatch(applicationActions.quit())
  };
}

export default connect(askQuitSelector, mapDispatchToProps)(React.createClass({
  displayName: 'AskQuitDialogViewer',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleAskQuitChange(event) {
    const props = this.props,
      oldValue = props.askQuit,
      value = event.target.checked;

    if (oldValue !== value) {
      props.onAskQuitChange([{key: 'askQuit', value}]);
    }
  },
  render() {
    return <AskQuit {...this.props} onAskQuitChange={this.handleAskQuitChange}/>;
  }
}));
