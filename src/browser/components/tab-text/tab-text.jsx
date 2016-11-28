import React from 'react';
import './tab-text.css';

/**
 * @class TabText
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'TabText',
  render: function () {
    const props = this.props;

    return <span className="tab-text"><span className="tab-text-inner">{props.children}</span></span>;
  }
});
