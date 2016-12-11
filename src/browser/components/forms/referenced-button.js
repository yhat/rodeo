import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'ReferencedButton',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this),
      handleClick = props.clickHandler && _.isFunction(props[props.clickHandler]) && props[props.clickHandler];
    let content;

    if (handleClick) {
      content = <button className="btn btn-default" onClick={handleClick}>{props.value}</button>;
    } else {
      content = <button className="btn btn-default" disabled>{props.value}</button>;
    }

    return (
      <div className={className.join(' ')}>
        <label htmlFor={props.id}>{text[props.label]}</label>
        {content}
      </div>
    );
  }
});
