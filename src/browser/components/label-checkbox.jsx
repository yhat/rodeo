import React from 'react';
import cid from '../services/cid';

export default React.createClass({
  displayName: 'LabelCheckbox',
  propTypes: {
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
    type: React.PropTypes.oneOf(['checkbox', 'radio'])
  },
  getDefaultProps: function () {
    return {
      disabled: false,
      required: false,
      type: 'checkbox'
    };
  },
  getInitialState: function () {
    return {};
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({innerId: nextProps.name + '-' + cid()});
  },
  render: function () {
    const props = this.props,
      state = this.state,
      className = ['label-checkbox', 'checkbox'], // bootstrap class
      inputClassName = [];

    if (props.className) {
      className.push(props.className);
    }

    // For the disabled cursor to show on the label, bootstrap requires the disabled class on the parent element
    if (props.disabled) {
      className.push('disabled');
    }

    return (
      <div className={className.join(' ')}>
        <label htmlFor={state.innerId}>
          <input
            className={inputClassName.join(' ')}
            disabled={props.disabled}
            id={state.innerId}
            name={props.name}
            placeholder={props.placeholder}
            type={props.type}
            value={props.value}
          />
          {props.label}
        </label>
      </div>
    );
  }
});
