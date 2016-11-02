import React from 'react';
import commonReact from '../../services/common-react';
import './document-terminal-page-break.css';

export default React.createClass({
  displayName: 'DocumentTerminalPageBreak',
  shouldComponentUpdate: function (nextProps) {
    return false;
  },
  render: function () {
    const className = commonReact.getClassNameList(this);

    return <hr className={className.join(' ')} />;
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
