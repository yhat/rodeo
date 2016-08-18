import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';

export default React.createClass({
  displayName: 'SetupInstallAnaconda',
  propTypes: {
    className: React.PropTypes.string,
    terminal: React.PropTypes.object,
    text: React.PropTypes.object
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
        <Marked className="explanation">{text.explainAnaconda}</Marked>
        <FakeTerminal {...props.terminal}/>
        <button className="btn btn-default" onClick={_.over(_.partial(props.onInputChange, 'terminal.cmd', 'python'), props.onExecute)}>{text.testInstall}</button>
        <button className="btn btn-default" onClick={_.partial(props.onTransition, 'manualCommand')}>{text.uniqueCommandForPython}</button>
      </div>
    );
  }
});
