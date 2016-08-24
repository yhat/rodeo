import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';

export default React.createClass({
  displayName: 'SetupNoPandas',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onTransition: React.PropTypes.func.isRequired,
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
        <div className="explanation"><Marked>{text.explainMissingDependences}</Marked></div>
        <FakeTerminal {...props.terminal}/>
        <button className="btn btn-primary btn-setup-action" onClick={_.partial(props.onTransition, 'installPandas')}>{text.installPandas}</button>
        <div className="secondary-explanation"><Marked>{text.explainPandas}</Marked></div>
      </div>
    );
  }
});
