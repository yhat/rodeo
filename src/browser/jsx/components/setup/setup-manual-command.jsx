import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';

export default React.createClass({
  displayName: 'SetupManualCommand',
  propTypes: {
    className: React.PropTypes.string,
    onExecute: React.PropTypes.func.isRequired,
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
        <div className="explanation">{props.text.askForPythonCommand}</div>
        <div className="input-group">
          <input className="form-control" onChange={_.partial(props.onInputChange, 'terminal.cmd')} type="text" value={props.terminal.cmd} />
          <span className="input-group-container">
            <button className="btn btn-primary" onClick={props.onExecute}>{text.okay}</button>
          </span>
        </div>
        <FakeTerminal {...props.terminal}/>
        <button className="btn btn-default" onClick={_.partial(props.onTransition, 'installAnaconda')}>{text.installAnaconda}</button>
      </div>
    );
  }
});
