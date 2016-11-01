import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../services/common-react';
import './terminal-history.css';
import DocumentHistory from '../../components/document-terminal/document';
import Prompt from '../prompt/prompt';
import EmptySuggestion from '../empty/empty-suggestion';

export default React.createClass({
  displayName: 'DocumentTerminal',
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onAnnotationFocus: React.PropTypes.func.isRequired,
    onAnnotationCopy: React.PropTypes.func.isRequired,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onPromptFocus: React.PropTypes.func.isRequired,
    onPromptCommand: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  componentWillUpdate: function () {
    const el = ReactDOM.findDOMNode(this);

    this.shouldScrollBottom = el.scrollTop + el.offsetHeight === el.scrollHeight;
  },
  componentDidUpdate: function () {
    if (this.shouldScrollBottom) {
      const el = ReactDOM.findDOMNode(this);

      el.scrollTop = el.scrollHeight;
    }
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      types = {
        line: item => (
          <Line
            key={block.id}
            {...block}
            onContract={_.partial(props.onContract, block.id)}
            onCopyToPrompt={props.onCopyToPrompt}
            onExpand={_.partial(props.onExpand, block.id)}
            onInstallPythonModule={_.partial(props.onInstallPythonModule, block.id)}
            onReRun={_.partial(props.onReRun, block)}
            onRemove={_.partial(props.onBlockRemove, block.id)}
          />
        )
      };
    let contents = [];

    if (props.blocks && props.blocks.length) {
      contents = _.map(props.blocks, block => types[block.type](block));
    } else {
      contents.push(<EmptySuggestion key="empty" label="Run a command."/>);
    }

    return (
      <div className={className.join(' ')}>
        <div>{contents}</div>
        <Prompt/>
      </div>
    );
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
