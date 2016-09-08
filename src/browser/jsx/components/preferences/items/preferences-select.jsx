import _ from 'lodash';
import React from 'react';

/**
 * @class PreferencesSelect
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesSelect',
  propTypes: {
    className: React.PropTypes.string,
    item: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      onChange: _.noop,
      type: 'text'
    };
  },
  render: function () {
    const content = [],
      displayName = this.constructor.displayName,
      props = this.props,
      item = props.item,
      className = [_.kebabCase(displayName)];

    if (props.className) {
      className.push(props.className);
    }

    if (item.label) {
      content.push(<label htmlFor={item.id}>{_.startCase(item.label)}</label>);
    }

    function getOption(option) {
      if (option.group) {
        return <optgroup label={option.label}>{option.group.map(getOption)}</optgroup>;
      } else {
        return <option value={option.value}>{option.label}</option>;
      }
    }

    content.push(
      <select onChange={props.onChange} {...item}>
        {item.options.map(getOption)}
      </select>
    );

    return <div className={className.join(' ')}>{content}</div>;
  }
});
