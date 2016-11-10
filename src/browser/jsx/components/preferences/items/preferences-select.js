import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';

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
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const content = [],
      props = this.props,
      item = props.item,
      className = commonReact.getClassNameList(this);

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
