import React from 'react';
import commonReact from '../../services/common-react';
import './closeable.css';

const closeTabClass = 'tabbed-pane-close';

export default React.createClass({
  displayName: 'Closeable',
  propTypes: {
    className: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this).concat(['fa', 'fa-times', closeTabClass]);

    return (
      <span
        className={className.join(' ')}
        onClick={props.onClick}
      />
    );
  }
});
