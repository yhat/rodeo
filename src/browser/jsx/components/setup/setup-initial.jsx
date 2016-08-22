import _ from 'lodash';
import React from 'react';
import ExitButton from './exit-button.jsx';
import logo from './logo-rodeo-grey-text.svg';

export default React.createClass({
  displayName: 'SetupInitial',
  propTypes: {
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    text: React.PropTypes.object.isRequired
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
        <ExitButton onClick={props.onCancel}/>
        <div className="brand"><img src={logo} /></div>
        <div className="explanation">{props.text.hello}</div>
      </div>
    );
  }
});
