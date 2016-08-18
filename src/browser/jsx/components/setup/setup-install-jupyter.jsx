import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';

export default React.createClass({
  displayName: 'SetupInstallJupyter',
  propTypes: {
    className: React.PropTypes.string,
    onPackageInstall: React.PropTypes.func.isRequired,
    secondaryTerminal: React.PropTypes.object.isRequired,
    terminal: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  componentDidMount: function () {
    this.props.onPackageInstall('jupyter');
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
        <Marked className="explanation">{text.explainJupyter}</Marked>
        <FakeTerminal {...props.terminal}/>
        <FakeTerminal {...props.secondaryTerminal}/>
        <button className="btn btn-primary" onClick={_.partial(props.onTransition, 'installAnaconda')}>{text.installAnaconda}</button>
        <button className="btn btn-default" onClick={props.onExecute}>{text.tryAgain}</button>
        <button className="btn btn-default" onClick={_.partial(props.onTransition, 'manualCommand')}>{text.uniqueCommandForPython}</button>
      </div>
    );
  }
});
