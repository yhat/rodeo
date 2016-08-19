import _ from 'lodash';
import React from 'react';
import FakeTerminal from './fake-terminal.jsx';

export default React.createClass({
  displayName: 'SetupInitial',
  propTypes: {
    className: React.PropTypes.string,
    text: React.PropTypes.object
  },
  componentDidMount: function () {
    this.props.onExecute();
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)];

    if (props.className) {
      className.push(props.className);
    }

    return (
      <div className={className.join(' ')}>
        <div className="explanation">{props.text.hello}</div>
      </div>
    );
  }
});
