import React from 'react';
import commonReact from '../../services/common-react';
import './input-select.css';

export default React.createClass({
  displayName: 'InputSelect',
  propTypes: {
    onChange: React.PropTypes.func,
    originalValue: React.PropTypes.string,
    value: React.PropTypes.string
  },
  contextTypes: {
    text: React.PropTypes.object
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);

    if (props.originalValue !== props.value) {
      className.push('select-input--modified');
    }

    function getOption(option) {
      if (option.group) {
        return <optgroup key={option.label} label={option.label}>{option.group.map(getOption)}</optgroup>;
      }

      return <option key={option.label} value={option.value}>{option.label}</option>;
    }

    return (
      <div className={className.join(' ')}>
        <label htmlFor={props.id}>{text[props.label]}</label>
        <select className="form-input" onChange={props.onChange} value={props.value}>{props.options.map(getOption)}</select>
      </div>
    );
  }
});
