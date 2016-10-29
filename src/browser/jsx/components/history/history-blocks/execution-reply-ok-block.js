/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import React from 'react';
import commonReact from '../../../services/common-react';
import './execution-reply-ok-block.css';

export default React.createClass({
  displayName: 'ExecutionReplyOKBlock',

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const className = commonReact.getClassNameList(this);

    className.push('font-monospaced');

    return (
      <section className={className.join(' ')}>{'√'}</section>
    );
  }
});
