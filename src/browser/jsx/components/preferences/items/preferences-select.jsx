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

    content.push(
      <select onChange={props.onChange} {...item}>
        {item.options.map(option => <option value={option.value}>{option.label}</option>)}
      </select>
    );

    return <div className={className.join(' ')}>{content}</div>;
  }
});
