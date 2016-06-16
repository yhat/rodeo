import _ from 'lodash';
import React from 'react';

const allowedPropsOnInput = ['id', 'type', 'defaultValue', 'value'];

/**
 * @class DocCode
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesItem',
  propTypes: {
    className: React.PropTypes.string,
    defaultValue: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number, React.PropTypes.bool]),
    id: React.PropTypes.string,
    inputWidth: React.PropTypes.string,
    onChange: React.PropTypes.func,
    placeholder: React.PropTypes.string,
    type: React.PropTypes.string,
    value: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number, React.PropTypes.bool])
  },
  getDefaultProps: function () {
    return {
      onChange: _.noop,
      type: 'text',
      defaultValue: ''
    };
  },
  render: function () {
    const props = this.props,
      inputProps = _.pick(props, allowedPropsOnInput);
    let label,
      inputStyle = {},
      className = [props.className];

    if (props.type === 'checkbox') {
      inputProps.checked = inputProps.value;
      inputProps.defaultChecked = inputProps.defaultValue;
      delete inputProps.value;
      delete inputProps.defaultValue;
    } else {
      className.push('form-control');
    }

    className = className.join(' ');

    if (props.label) {
      label = <label className="control-label" htmlFor={props.id}>{_.startCase(props.label)}</label>;
    }

    if (props.inputWidth) {
      inputStyle.width = props.inputWidth;
    }

    return (
      <div className="form-group">
        {label}
        <input
          className={className}
          onChange={props.onChange}
          style={inputStyle}
          {...inputProps}
        />
      </div>
    );
  }
});
