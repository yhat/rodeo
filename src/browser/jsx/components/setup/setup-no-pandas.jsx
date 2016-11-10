import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupNoPandas',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired,
    terminal: React.PropTypes.object.isRequired,
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = props.text,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <div>
          <div className="explanation"><Marked>{text.explainMissingDependences}</Marked></div>
          <FakeTerminal {...props.terminal}/>
          <button className="btn btn-primary btn-setup-action" onClick={_.partial(props.onTransition, 'installPandas')}>{text.installPandas}</button>
          <div className="secondary-explanation"><Marked>{text.explainPandas}</Marked></div>
        </div>
      </div>
    );
  }
});
