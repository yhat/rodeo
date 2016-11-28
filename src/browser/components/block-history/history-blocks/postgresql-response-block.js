import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';
import Closeable from '../../tabs/closeable';
import ErrorBlock from './error-block';
import InputStreamBlock from './input-stream-block';
import ExecutionResultBlock from './execution-result-block';
import './postgresql-response-block.css';

export default React.createClass({
  displayName: 'PostgresqlResponseBlock',
  propTypes: {
    items: React.PropTypes.array,
    onContract: React.PropTypes.func.isRequired,
    onCopyToPrompt: React.PropTypes.func,
    onExpand: React.PropTypes.func.isRequired,
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
        error: item => <ErrorBlock key={item.id} {...props} {...item}/>,
        input: item => <InputStreamBlock key={item.id} {...props} {...item}/>,
        result: item => (
          <ExecutionResultBlock
            key={item.id}
            {...props}
            {...item}
            onSave={_.partial(props.onSave, item.id)}
          />
        )
      };

    return (
      <section className={className.join(' ')}>
        <div className="postgresql-response-block__menu">
          <Closeable onClick={props.onRemove}/>
        </div>
        <div className="postgresql-response-block__items">
          {items.map(item => types[item.type](item))}
        </div>
      </section>
    );
  }
});
