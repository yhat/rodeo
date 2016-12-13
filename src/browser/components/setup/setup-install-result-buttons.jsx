import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupInstallResultButtons',
  propTypes: {
    explanationLabel: React.PropTypes.string.isRequired,
    installAnacondaLabel: React.PropTypes.string.isRequired,
    installFailLabel: React.PropTypes.string.isRequired,
    installSuccessLabel: React.PropTypes.string.isRequired,
    installingLabel: React.PropTypes.string.isRequired,
    onExecute: React.PropTypes.func.isRequired,
    onPackageInstall: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired,
    terminal: React.PropTypes.object.isRequired,
    tryAgainLabel: React.PropTypes.string.isRequired,
    uniqueCommandLabel: React.PropTypes.string.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      buttons = [],
      terminal = props.terminal,
      text = this.context.text;
    let message;

    if (terminal.state === 'executed') {
      if (terminal.code !== 0) {
        message = <div>{text.installFail}</div>;

        buttons.push(
          <button className="btn btn-primary btn-setup-action"
            onClick={_.partial(props.onTransition, 'installAnaconda')}
          >{text.installAnaconda}</button>
        );
        buttons.push(
          <button
            className="btn btn-default btn-setup-action"
            onClick={props.onExecute}
          >{text.tryAgain}</button>
        );
      } else {
        message = <div>{text.installSuccess}</div>;

        buttons.push(
          <button
            className="btn btn-primary btn-setup-action"
            onClick={props.onExecute}
          >{text.tryAgain}</button>
        );
      }

      buttons.push(
        <button className="btn btn-default btn-setup-action" onClick={_.partial(props.onTransition, 'manualCommand')}>
          {text.uniqueCommandForPython}
        </button>
      );
    } else if (terminal.state === 'executing') {
      message = <div>{text.installing}</div>;
    }

    return (
      <div className={className.join(' ')}>
        <div className="explanation"><Marked>{props.explanationLabel}</Marked></div>
        <FakeTerminal {...props.terminal}/>
        {message}
        {buttons}
      </div>
    );
  }
});
