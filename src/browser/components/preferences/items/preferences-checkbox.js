import React from 'react';
import commonReact from '../../../services/common-react';

export default React.createClass({
  displayName: 'PreferencesCheckbox',
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    originalValue: React.PropTypes.bool,
    value: React.PropTypes.bool
  },
  childContextTypes: {
    text: React.PropTypes.object
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <label htmlFor={props.id}>{text[props.label]}</label>
        <input checked={props.value} onChange={props.onChange} type="checkbox"/>
      </div>
    );
  }
});
