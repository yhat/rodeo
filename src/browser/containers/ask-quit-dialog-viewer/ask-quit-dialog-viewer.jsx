import React from 'react';
import commonReact from '../../services/common-react';
import {connect} from 'react-redux';
import AskQuit from '../../components/dialogs/ask-quit';
import selectors from './ask-quit-dialog-viewer.selectors';
import applicationActions from '../../actions/application';
import actions from '../../actions/preferences';

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

export default connect(selectors.getAskQuit, mapDispatchToProps)(React.createClass({
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
