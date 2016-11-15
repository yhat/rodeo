import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../services/common-react';
import JupyterResponseBlock from './history-blocks/jupyter-response-block';
import PostgresqlResponseBlock from './history-blocks/postgresql-response-block';
import EmptySuggestion from '../empty/empty-suggestion';
import './block-history.css';

export default React.createClass({
  displayName: 'BlockHistory',
  propTypes: {
    blocks: React.PropTypes.array.isRequired,
    onBlockRemove: React.PropTypes.func.isRequired,
    onContract: React.PropTypes.func.isRequired,
    onCopyToPrompt: React.PropTypes.func.isRequired,
    onExpand: React.PropTypes.func.isRequired,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onReRun: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired
  },
  getDefaultProps() {
    return {
      onBlockRemove: _.noop,
      onContract: _.noop,
      onCopyToPrompt: _.noop,
      onExpand: _.noop,
      onInstallPythonModule: _.noop,
      onReRun: _.noop
    };
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  componentWillUpdate() {
    const el = ReactDOM.findDOMNode(this);

    this.shouldScrollBottom = el.scrollTop + el.offsetHeight === el.scrollHeight;
  },
  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const el = ReactDOM.findDOMNode(this);

      el.scrollTop = el.scrollHeight;
    }
  },
  render() {
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
            onSave={_.partial(props.onSave, block.id)}
          />
        ),
        postgresqlResponse: block => (
          <PostgresqlResponseBlock
            key={block.id}
            {...block}
            onContract={_.partial(props.onContract, block.id)}
            onExpand={_.partial(props.onExpand, block.id)}
            onRemove={_.partial(props.onBlockRemove, block.id)}
            onSave={_.partial(props.onSave, block.id)}
          />
        )
      },
      style = {fontSize: props.fontSize};
    let contents = _.map(_.filter(props.blocks, block => block.hasVisibleContent), block => types[block.type](block));

    if (!(contents && contents.length)) {
      contents = <EmptySuggestion key="empty" label="Run a command."/>;
      className.push('block-history--empty');
    }

    return <div className={className.join(' ')} style={style}>{contents}</div>;
  }
});
