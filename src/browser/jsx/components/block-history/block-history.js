import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../services/common-react';
import './block-history.css';
import JupyterResponseBlock from './history-blocks/jupyter-response-block';
import EmptySuggestion from '../empty/empty-suggestion';

export default React.createClass({
  displayName: 'BlockHistory',
  propTypes: {
    blocks: React.PropTypes.array.isRequired,
    onBlockRemove: React.PropTypes.func.isRequired,
    onContract: React.PropTypes.func.isRequired,
    onCopyToPrompt: React.PropTypes.func.isRequired,
    onExpand: React.PropTypes.func.isRequired,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onReRun: React.PropTypes.func.isRequired
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
        jupyterResponse: block => (
          <JupyterResponseBlock
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

    return <div className={className.join(' ')}>{contents}</div>;
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
