import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupManualCommand',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onExecute: React.PropTypes.func.isRequired,
    terminal: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shallowEqual(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = props.text,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <div className="explanation"><Marked>{props.text.askForPythonCommand}</Marked></div>
        <div className="input-group input-python-cmd">
          <input className="form-control" onChange={_.partial(props.onInputChange, 'terminal.cmd')} type="text" value={props.terminal.cmd} />
          <span className="input-group-container">
            <button className="btn btn-primary" onClick={props.onExecute}>{text.okay}</button>
          </span>
        </div>
        <FakeTerminal {...props.terminal}/>
        <button className="btn btn-default btn-setup-action" onClick={props.onExecute}>{text.tryAgain}</button>
        <button className="btn btn-default btn-setup-action" onClick={_.partial(props.onTransition, 'installAnaconda')}>{text.installAnaconda}</button>
      </div>
    );
  }
});
