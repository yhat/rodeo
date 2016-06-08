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
    onChange: React.PropTypes.func,
    options: React.PropTypes.array,
    value: React.PropTypes.oneOfType([React.PropTypes.string])
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

    className = className.join(' ');

    if (props.label) {
      label = <label className="control-label" htmlFor={props.id}>{_.startCase(props.label)}</label>;
    }

    return (
      <div className="form-group">
        {label}
        <select
          className={className}
          onChange={props.onChange}
          style={inputStyle}
          {...inputProps}
        >
          {props.options.map(option => <option value={option.value}>{option.label}</option>)}
        </select>
      </div>
    );
  }
});
