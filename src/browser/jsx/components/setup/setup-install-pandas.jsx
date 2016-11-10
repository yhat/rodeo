import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupInstallPandas',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onPackageInstall: React.PropTypes.func.isRequired,
    secondaryTerminal: React.PropTypes.object.isRequired,
    terminal: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  componentDidMount: function () {
    this.props.onPackageInstall('pandas');
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = props.text,
      className = commonReact.getClassNameList(this),
      buttons = [];

    if (props.secondaryTerminal.code !== 0) {
      buttons.push(
        <button className="btn btn-primary btn-setup-action" onClick={_.partial(props.onTransition, 'installAnaconda')}>
          {text.installAnaconda}
        </button>
      );
    }

    buttons.push(<button className="btn btn-default btn-setup-action" onClick={props.onExecute}>{text.tryAgain}</button>);
    buttons.push(
      <button className="btn btn-default btn-setup-action" onClick={_.partial(props.onTransition, 'manualCommand')}>
        {text.uniqueCommandForPython}
      </button>
    );

    return (
      <div className={className.join(' ')}>
        <div>
          <div className="explanation"><Marked>{text.explainPandas}</Marked></div>
          <FakeTerminal {...props.terminal}/>
          <FakeTerminal {...props.secondaryTerminal}/>
          {buttons}
        </div>
      </div>
    );
  }
});
