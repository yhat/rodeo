import _ from 'lodash';
import React from 'react';
import PreferencesItemErrors from '../preferences-item-errors.jsx';

/**
 * @class PreferencesText
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesText',
  propTypes: {
    className: React.PropTypes.string,
    item: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      item = props.item,
      content = [];
    let label,
      className = [_.kebabCase(displayName)];

    if (props.className) {
      className.push(props.className);
    }

    if (item.label) {
      content.push(<label htmlFor={item.id} key="label">{_.startCase(item.label)}</label>);
    }

    content.push(<input key="input" onChange={props.onChange} {...item} type="text"/>);

    return <div className={className.join(' ')}>{content}</div>;
  }
});
