import React from 'react';
import cid from '../services/cid';

export default React.createClass({
  displayName: 'LabelInput',
  propTypes: {
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
    type: React.PropTypes.string.isRequired
  },
  getDefaultProps: function () {
    return {
      disabled: false,
      required: false,
      type: 'text'
    };
  },
  getInitialState: function () {
    return {};
  },
  componentWillMount: function () {
    const props = this.props;

    this.setState({innerId: props.name + '-' + cid()});
  },
  render: function () {
    const props = this.props,
      state = this.state,
      className = ['label-input', 'form-group'],
      inputClassName = [];

    if (props.className) {
      className.push(props.className);
    }

    // For the disabled cursor to show on the label, bootstrap requires the disabled class on the parent element
    if (props.disabled) {
      className.push('disabled');
    }

    if (props.required) {
      className.push('required');
    }

    if (props.type !== 'checkbox') {
      inputClassName.push('form-control');
    }

    return (
      <div className={className.join(' ')}>
        <label
          htmlFor={state.innerId}
        >{props.label}</label>
        <input
          className={inputClassName.join(' ')}
          disabled={props.disabled}
          id={state.innerId}
          name={props.name}
          placeholder={props.placeholder}
          required={props.required}
          type={props.type}
          value={props.value}
        />
      </div>
    );
  }
});
