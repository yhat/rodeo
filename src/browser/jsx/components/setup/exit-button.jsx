import _ from 'lodash';
import React from 'react';
import './exit-button.css';

export default React.createClass({
  displayName: 'ExitButton',
  propTypes: {
    className: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function () {
    return false;
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName), 'fa', 'fa-times'];

    if (props.className) {
      className.push(props.className);
    }

    return (
      <div className={className.join(' ')} onClick={props.onClick}/>
    );
  }
});
