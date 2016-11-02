/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';
import './execution-result-block.css';

export default React.createClass({
  displayName: 'ExecutionResultBlock',
  propTypes: {
    data: React.PropTypes.object
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      data = props.data,
      size = _.size(data);
    let content;

    className.push('font-monospaced');

    if (size > 1) {
      if (data['text/html']) {
        content = <div dangerouslySetInnerHTML={{__html: data['text/html']}} />;
      } else {
        content = <span>{JSON.stringify(data)}</span>;
      }
    } else if (size === 1) {
      if (data['text/plain']) {
        content = <span>{data['text/plain']}</span>;
      } else {
        content = <span>{JSON.stringify(data)}</span>;
      }
    } else {
      content = <span>{'√'}</span>;
    }

    return (
      <div className={className.join(' ')}><header>{'result'}</header>{content}</div>
    );
  }
});
