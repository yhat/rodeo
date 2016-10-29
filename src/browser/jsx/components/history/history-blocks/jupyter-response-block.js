/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import React from 'react';
import commonReact from '../../../services/common-react';
import Closeable from '../../tabs/closeable';
import ExecutionReplyOKBlock from './execution-reply-ok-block';
import ExecutionResultBlock from './execution-result-block';
import InputStreamBlock from './input-stream-block';
import ImageBlock from './image-block';
import TextStreamBlock from './text-stream-block';
import PythonErrorBlock from './python-error-block';
import './jupyter-response-block.css';

export default React.createClass({
  displayName: 'JupyterResponseBlock',
  propTypes: {
    items: React.PropTypes.array,
    onCopyToPrompt: React.PropTypes.func.isRequired,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onReRun: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
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
        executionReplyOK: item => <ExecutionReplyOKBlock key={item.id} {...props} {...item}/>,
        executionResult: item => <ExecutionResultBlock key={item.id} {...props} {...item}/>,
        inputStream: item => <InputStreamBlock key={item.id} {...props} {...item}/>,
        image: item => <ImageBlock key={item.id} {...props} {...item}/>,
        pythonError: item => <PythonErrorBlock key={item.id} {...props} {...item}/>,
        statusChange: () => null,
        textStream: item => <TextStreamBlock key={item.id} {...props} {...item}/>
      };

    return (
      <div className={className.join(' ')}>
        <div className="jupyter-response-block__menu">
          <Closeable onClick={props.onRemove}/>
        </div>
        <div className="jupyter-response-block-items">
          {items.map(item => types[item.type](item))}
        </div>
      </div>
    );
  }
});
