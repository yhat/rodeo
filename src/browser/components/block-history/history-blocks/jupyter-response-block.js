/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';
import Closeable from '../../tabs/closeable';
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
    onContract: React.PropTypes.func.isRequired,
    onCopyToPrompt: React.PropTypes.func,
    onExpand: React.PropTypes.func.isRequired,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onReRun: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired
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
        executionReplyOK: () => null,
        executionResult: item => (
          <ExecutionResultBlock
            key={item.id}
            {...props}
            {...item}
            onSave={_.partial(props.onSave, item.id)}
          />
        ),
        inputStream: item => (
          <InputStreamBlock
            key={item.id}
            {...props}
            {...item}
            onContract={_.partial(props.onContract, item.id)}
            onExpand={_.partial(props.onExpand, item.id)}
          />
        ),
        image: item => (
          <ImageBlock
            key={item.id}
            {...props}
            {...item}
            onContract={_.partial(props.onContract, item.id)}
            onExpand={_.partial(props.onExpand, item.id)}
          />
        ),
        pythonError: item => <PythonErrorBlock key={item.id} {...props} {...item}/>,
        statusChange: () => null,
        textStream: item => (
          <TextStreamBlock
            key={item.id}
            {...props}
            {...item}
            onContract={_.partial(props.onContract, item.id)}
            onExpand={_.partial(props.onExpand, item.id)}
          />
        )
      };

    return (
      <section className={className.join(' ')}>
        <div className="jupyter-response-block__menu">
          <Closeable onClick={props.onRemove}/>
        </div>
        <div className="jupyter-response-block-items">
          {items.map(item => types[item.type](item))}
        </div>
      </section>
    );
  }
});
