import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';

/**
 * @class PreferencesCheckbox
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesCheckbox',
  propTypes: {
    item: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      content = [],
      item = _.clone(props.item);

    if (item.label) {
      content.push(<label htmlFor={item.id} key="label">{_.startCase(item.label)}</label>);
    }

    item.checked = item.value;
    delete item.value;

    content.push(<input key="input" onChange={props.onChange} {...item} type="checkbox"/>);

    return <div className={className.join(' ')}>{content}</div>;
  }
});
