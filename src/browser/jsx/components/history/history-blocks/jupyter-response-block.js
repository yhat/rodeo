/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import React from 'react';
import commonReact from '../../../services/common-react';
import TextStreamBlock from './text-stream-block';

export default React.createClass({
  displayName: 'JupyterResponseBlock',
  propTypes: {
    items: React.PropTypes.array
  },
  getDefaultProps: function () {
    return {
      chunks: [],
      expanded: false
    };
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      items = props.items,
      types = {
        textStream: item => <TextStreamBlock key={item.id} {...props} {...item}/>
      };

    return (
      <div className={className.join(' ')}>{items.map(item => types[item.type](item))}</div>
    );
  }
});
