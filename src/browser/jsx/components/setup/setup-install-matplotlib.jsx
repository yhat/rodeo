import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';

export default React.createClass({
  displayName: 'SetupInstallMatplotlib',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onPackageInstall: React.PropTypes.func.isRequired,
    secondaryTerminal: React.PropTypes.object.isRequired,
    terminal: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  componentDidMount: function () {
    this.props.onPackageInstall('matplotlib');
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      text = props.text,
      className = [_.kebabCase(displayName)],
      buttons = [];

    if (props.className) {
      className.push(props.className);
    }

    if (props.secondaryTerminal.code !== 0) {
      buttons.push(
        <button className="btn btn-primary btn-setup-action" onClick={_.partial(props.onTransition, 'installAnaconda')}>
          {text.installAnaconda}
        </button>
      );
    }

    buttons.push(<button className="btn btn-default btn-setup-action" onClick={props.onExecute}>{text.tryAgain}</button>);
    buttons.push(
      <button className="btn btn-default btn-setup-action" onClick={_.partial(props.onTransition, 'manualCommand')}>
        {text.uniqueCommandForPython}
      </button>
    );

    return (
      <div className={className.join(' ')}>
        <div className="explanation"><Marked>{text.explainMatplotlib}</Marked></div>
        <FakeTerminal {...props.terminal}/>
        <FakeTerminal {...props.secondaryTerminal}/>
        {buttons}
      </div>
    );
  }
});
