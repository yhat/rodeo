import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';
import Marked from '../marked/marked.jsx';
import ExitButton from './exit-button.jsx';

export default React.createClass({
  displayName: 'SetupNoNumpy',
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
        <ExitButton onClick={props.onCancel}/>
        <Marked className="explanation">{text.explainMissingDependences}</Marked>
        <FakeTerminal {...props.terminal}/>
        <button className="btn btn-primary btn-setup-action" onClick={_.partial(props.onTransition, 'installNumpy')}>{text.installNumpy}</button>
        <div className="secondary-explanation"><Marked>{text.explainNumpy}</Marked></div>
      </div>
    );
  }
});
