import React from 'react';
import commonReact from '../../services/common-react';
import './preferences-tab.css';

export default React.createClass({
  displayName: 'PreferencesTab',
  propTypes: {
    active: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    id: React.PropTypes.string,
    onClick: React.PropTypes.func
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    if (props.active) {
      className.push('preferences-tab--active');
    }

    if (props.disabled) {
      className.push('preferences-tab--disabled');
    }

    return <div className={className.join(' ')} id={props.id} onClick={props.onClick}>{props.children}</div>;
  }
});
