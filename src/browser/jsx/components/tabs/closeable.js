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
    console.log('Closeable', 'shouldComponentUpdate', !commonReact.shallowEqual(this, nextProps));
    return !commonReact.shallowEqual(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = ['fa', 'fa-times', closeTabClass];

    console.log('Closable', 'render');

    if (props.className) {
      className.push(props.className);
    }

    return (
      <span
        className={className.join(' ')}
        onClick={props.onClick}
      />
    );
  }
});
