import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';

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
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      item = props.item,
      content = [],
      className = commonReact.getClassNameList(this);

    if (item.label) {
      content.push(<label htmlFor={item.id} key="label">{_.startCase(item.label)}</label>);
    }

    content.push(<input key="input" onChange={props.onChange} {...item} type="text"/>);

    return <div className={className.join(' ')}>{content}</div>;
  }
});
