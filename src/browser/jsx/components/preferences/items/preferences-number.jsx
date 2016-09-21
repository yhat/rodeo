import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';

/**
 * @class PreferencesNumber
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesNumber',
  propTypes: {
    className: React.PropTypes.string,
    item: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      content = [],
      className = [_.kebabCase(displayName)],
      item = props.item;

    if (props.className) {
      className.push(props.className);
    }

    if (item.label) {
      content.push(<label htmlFor={item.id} key="label">{_.startCase(item.label)}</label>);
    }

    content.push(<input key="input" onChange={props.onChange}  {...item} type="number"/>);

    return <div className={className.join(' ')}>{content}</div>;
  }
});
