import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';
import ExitButton from './exit-button.jsx';

export default React.createClass({
  displayName: 'SetupInstallPandas',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onPackageInstall: React.PropTypes.func.isRequired,
    secondaryTerminal: React.PropTypes.object.isRequired,
    terminal: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  componentDidMount: function () {
    this.props.onPackageInstall('pandas');
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
        <Marked className="explanation">{text.explainPandas}</Marked>
        <FakeTerminal {...props.terminal}/>
        <FakeTerminal {...props.secondaryTerminal}/>
        <button className="btn btn-primary btn-setup-action" onClick={_.partial(props.onTransition, 'installAnaconda')}>{text.installAnaconda}</button>
        <button className="btn btn-default btn-setup-action" onClick={props.onExecute}>{text.tryAgain}</button>
        <button className="btn btn-default btn-setup-action" onClick={_.partial(props.onTransition, 'manualCommand')}>{text.uniqueCommandForPython}</button>
      </div>
    );
  }
});
