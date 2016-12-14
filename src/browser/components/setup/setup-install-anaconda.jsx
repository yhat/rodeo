import _ from 'lodash';
import React from 'react';
import Marked from '../marked';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupInstallAnaconda',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onOpenExternal: React.PropTypes.func.isRequired,
    onRestart: React.PropTypes.func.isRequired
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
          <div className="explanation"><Marked>{text.explainAnaconda}</Marked></div>
          <div>
            <div>{'Install Anaconda and restart Rodeo'}</div>
            <button
              className="btn btn-primary btn-setup-action"
              onClick={_.partial(props.onOpenExternal, 'https://www.continuum.io/downloads')}
            >{text.installAnaconda}</button>
            <button
              className="btn btn-default btn-setup-action"
              onClick={_.over(_.partial(props.onInputChange, 'terminal.cmd', 'python'), props.onRestart)}
            >{text.restart}</button>
          </div>
          <hr />
          <div>
            <button
              className="btn btn-default btn-setup-action"
              onClick={_.partial(props.onTransition, 'manualCommand')}
            >{text.uniqueCommandForPython}</button>
          </div>
        </div>
      </div>
    );
  }
});
