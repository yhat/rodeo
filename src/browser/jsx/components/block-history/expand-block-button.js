import React from 'react';
import commonReact from '../../services/common-react';
import './expand-block-button.css';

export default React.createClass({
  displayName: 'ExpandBlockButton',
  propTypes: {
    direction: React.PropTypes.string,
    onClick: React.PropTypes.func
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);
    let content;

    if (props.direction === 'up') {
      content = <span className="fa fa-caret-up" />;
    } else {
      content = <span className="fa fa-caret-down" />;
    }

    return <div className={className.join(' ')} onClick={props.onClick}>{content}</div>;
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
