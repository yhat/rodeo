import React from 'react';
import './gray-info.css';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'GrayInfoLink',
  propTypes: {
    icon: React.PropTypes.string,
    label: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired,
    title: React.PropTypes.string
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);
    let icon;

    if (props.icon) {
      icon = <span className={['fa', 'fa-' + props.icon].join(' ')}/>;
    }

    return (
      <div className={className} onClick={props.onClick} title={props.title}>
        {icon}
        {props.label}
      </div>
    );
  }
});
