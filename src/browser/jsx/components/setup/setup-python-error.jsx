import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';

export default React.createClass({
  displayName: 'SetupPythonError',
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
        <div className="explanation">{text.pythonError}</div>
        <FakeTerminal {...props.terminal}/>
        <button className="btn btn-primary" onClick={_.partial(props.onTransition, 'installAnaconda')}>{text.installAnaconda}</button>
        <button className="btn btn-default" onClick={_.partial(props.onTransition, 'manualCommand')}>{text.uniqueCommandForPython}</button>
      </div>
    );
  }
});
