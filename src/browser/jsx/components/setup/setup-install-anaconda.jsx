import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';
import ExitButton from './exit-button.jsx';

export default React.createClass({
  displayName: 'SetupInstallAnaconda',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    terminal: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      text = props.text,
      className = [_.kebabCase(displayName)];

    if (props.className) {
      className.push(props.className);
    }

    return (
      <div className={className.join(' ')}>
        <ExitButton onClick={props.onCancel}/>
        <div className="explanation"><Marked>{text.explainAnaconda}</Marked></div>
        <FakeTerminal {...props.terminal}/>
        <button className="btn btn-default btn-setup-action" onClick={_.over(_.partial(props.onInputChange, 'terminal.cmd', 'python'), props.onExecute)}>{text.testInstall}</button>
        <button className="btn btn-default btn-setup-action" onClick={_.partial(props.onTransition, 'manualCommand')}>{text.uniqueCommandForPython}</button>
      </div>
    );
  }
});
