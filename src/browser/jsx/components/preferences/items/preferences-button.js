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
    item: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      content = [],
      className = commonReact.getClassNameList(this),
      item = props.item,
      handleClick = props.onClick && _.isFunction(props[props.onClick]) && props[props.onClick];

    if (item.label) {
      content.push(<label htmlFor={item.id} key="label">{_.startCase(item.label)}</label>);
    }

    if (handleClick) {
      content.push(<button key="input" onClick={handleClick}  {...item}/>);
    } else {
      content.push(<button disabled key="input"  {...item}/>);
    }

    return <div className={className.join(' ')}>{content}</div>;
  }
});
