import React from 'react';
import commonReact from '../../services/common-react';
import './tabbed-form-list-dialog-tab.css';

export default React.createClass({
  displayName: 'TabbedFormListDialogTab',
  propTypes: {
    active: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    id: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);

    if (props.active) {
      className.push('tabbed-form-list-dialog--active');
    }

    if (props.disabled) {
      className.push('tabbed-form-list-dialog--disabled');
    }

    return <div className={className.join(' ')} id={props.id} onClick={props.onClick}>{text[props.label]}</div>;
  }
});
