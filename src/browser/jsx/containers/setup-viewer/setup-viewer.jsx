import React from 'react';
import {connect} from 'react-redux';
import Setup from '../../components/setup/setup.jsx';
import actions from './setup-viewer.actions';
import text from './setup-text.yml';

function mapStateToProps(state) {
  return state.setup;
}

function mapDispatchToProps(dispatch) {
  return {
    onCancel: () => dispatch(actions.cancel()),
    onExecute: () => dispatch(actions.execute()),
    onFinish: () => dispatch(actions.finish()),
    onInputChange: (key, event) => dispatch(actions.changeInput(key, event)),
    onPackageInstall: targetPackage => dispatch(actions.installPackage(targetPackage)),
    onTransition: contentType => dispatch(actions.transition(contentType))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'SetupViewer',
  render: function () {
    return <Setup text={text} {...this.props} />;
  }
}));
