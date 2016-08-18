import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';

export default React.createClass({
  displayName: 'SetupReady',
  propTypes: {
    className: React.PropTypes.string,
    onFinish: React.PropTypes.func.isRequired
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
        <button className="btn btn-default" onClick={props.onFinish}>{text.readyToRodeo}</button>
      </div>
    );
  }
});
