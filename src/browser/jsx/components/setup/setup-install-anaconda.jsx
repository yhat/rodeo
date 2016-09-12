import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupInstallAnaconda',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onRestart: React.PropTypes.func.isRequired,
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
        <div className="explanation"><Marked>{text.explainAnaconda}</Marked></div>
        <FakeTerminal {...props.terminal}/>
        <button className="btn btn-default btn-setup-action" onClick={_.over(_.partial(props.onInputChange, 'terminal.cmd', 'python'), props.onRestart)}>{text.restart}</button>
        <button className="btn btn-default btn-setup-action" onClick={_.partial(props.onTransition, 'manualCommand')}>{text.uniqueCommandForPython}</button>
      </div>
    );
  }
});
