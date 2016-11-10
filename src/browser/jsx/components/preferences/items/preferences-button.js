import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';

/**
 * @class PreferencesNumber
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesButton',
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
      handleClick = item.onClickHandler && _.isFunction(props[item.onClickHandler]) && props[item.onClickHandler];

    if (item.label) {
      content.push(<label htmlFor={item.id} key="label">{_.startCase(item.label)}</label>);
    }

    if (handleClick) {
      content.push(<button className="btn btn-default" key="input" onClick={handleClick} {...item}>{item.value}</button>);
    } else {
      content.push(<button className="btn btn-default" disabled key="input" {...item}/>);
    }

    return <div className={className.join(' ')}>{content}</div>;
  }
});
