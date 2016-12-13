import React from 'react';
import commonReact from '../../services/common-react';
import './full-screen.css';

export default React.createClass({
  displayName: 'FullScreen',
  propTypes: {
    row: React.PropTypes.bool
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    if (props.row) {
      className.push('full-screen--row');
    }

    return <div className={className.join(' ')}>{props.children}</div>;
  }
});
