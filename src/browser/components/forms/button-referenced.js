import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'ButtonReferenced',
  contextTypes: {
    text: React.PropTypes.object
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this),
      handleClick = props.clickHandler && _.isFunction(props[props.clickHandler]) && _.partial(props[props.clickHandler], props.value);
    let content;

    if (handleClick) {
      content = <button className="btn btn-default" onClick={handleClick}>{text[props.label]}</button>;
    } else {
      content = <button className="btn btn-default" disabled>{text[props.label]}</button>;
    }

    return <div className={className.join(' ')}>{content}</div>;
  }
});
