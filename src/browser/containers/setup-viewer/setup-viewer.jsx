import React from 'react';
import {connect} from 'react-redux';
import Setup from '../../components/setup/setup.jsx';
import actions from './setup-viewer.actions';
import articles from './articles.yml';

function mapStateToProps(state) {
  return state.setup;
}

function mapDispatchToProps(dispatch) {
  return {
    onCancel: () => dispatch(actions.cancel()),
    onExecute: () => dispatch(actions.execute()),
    onFinish: () => dispatch(actions.finish()),
    onInputChange: (key, event) => dispatch(actions.changeInput(key, event)),
    onOpenExternal: url => dispatch(actions.openExternal(url)),
    onPackageInstall: targetPackage => dispatch(actions.installPackage(targetPackage)),
    onRestart: () => dispatch(actions.restart()),
    onSkipStartup: () => dispatch(actions.skipStartup()),
    onTransition: contentType => dispatch(actions.transition(contentType))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'SetupViewer',
  render: function () {
    return <Setup articles={articles} {...this.props} />;
  }
}));
