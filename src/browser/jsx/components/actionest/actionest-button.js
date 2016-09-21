import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './actionest.css';

export default React.createClass({
  displayName: 'ActionestButton',
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired
  },
  getDefaultProps: function () {
    return {onClick: _.noop};
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    className.push('actionest');
    className.push('fa', 'fa-' + props.icon);

    return <div className={className.join(' ')} onClick={props.onClick} />;
  }
});
