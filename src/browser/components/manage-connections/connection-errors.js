import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './connection-errors.css';

function filterErrorMessages(error) {
  if (error.message) {
    if (_.includes(error.message, 'ECONNREFUSED')) {
      return 'Connection refused';
    } else if (_.includes(error.message, 'getaddrinfo ENOTFOUND')) {
      return 'Address not found';
    } else if (/role ".+" does not exist/.test(error.message)) {
      return 'User not found';
    } else if (/database ".+" does not exist/.test(error.message)) {
      return 'Database not found';
    } else {
      return error.message;
    }
  } else {
    return error.toString();
  }
}

export default React.createClass({
  displayName: 'ConnectionErrors',
  propTypes: {
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        {props.errors.map(error => <div>{filterErrorMessages(error)}</div>)}
      </div>
    );
  }
});
