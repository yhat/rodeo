import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import SetupSkipStartup from './setup-skip-startup';
import Marked from '../marked';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupNoScipy',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired,
    terminal: React.PropTypes.object.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <div className="setup-inner">
          <div className="explanation"><Marked>{text.explainMissingDependences}</Marked></div>
          <FakeTerminal {...props.terminal}/>
          <button className="btn btn-primary btn-setup-action" onClick={_.partial(props.onTransition, 'installScipy')}>{text.installScipy}</button>
          <div className="secondary-explanation"><Marked>{text.explainScipy}</Marked></div>
          <SetupSkipStartup {...props}/>
        </div>
      </div>
    );
  }
});
