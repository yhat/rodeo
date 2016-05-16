import _ from 'lodash';
import React from 'react';

const allowedPropsOnInput = ['id', 'type', 'defaultValue'];

/**
 * @class DocCode
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesItem',
  propTypes: {
    className: React.PropTypes.string,
    defaultValue: React.PropTypes.string,
    id: React.PropTypes.string,
    onChange: React.PropTypes.func,
    placeholder: React.PropTypes.string,
    type: React.PropTypes.string
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
      inputProps = _.pick(props, allowedPropsOnInput),
      className = [(props.type !== 'checkbox' ? 'form-control' : ''), props.className].join(' ');
    let label;

    if (props.label) {
      label = <label className="control-label" htmlFor={props.id}>{_.startCase(props.label)}</label>;
    }

    return (
      <div className="form-group">
        {label}
        <input
          className={className}
          onChange={props.onChange}
          {...inputProps}
        />
      </div>
    );
  }
});
