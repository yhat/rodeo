import _ from 'lodash';
import React from 'react';

/**
 * @class PreferencesCheckbox
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesCheckbox',
  propTypes: {
    className: React.PropTypes.string,
    item: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)],
      content = [],
      item = _.clone(props.item);

    if (props.className) {
      className.push(props.className);
    }

    if (item.label) {
      content.push(<label htmlFor={item.id} key="label">{_.startCase(item.label)}</label>);
    }

    item.checked = item.value;
    delete item.value;

    content.push(<input key="input" onChange={props.onChange} {...item} type="checkbox"/>);

    return <div className={className.join(' ')}>{content}</div>;
  }
});
