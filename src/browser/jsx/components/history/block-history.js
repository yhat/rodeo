import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './block-history.css';
import TextStreamBlock from './history-blocks/text-stream-block';
import EmptySuggestion from '../empty/empty-suggestion';

export default React.createClass({
  displayName: 'BlockHistory',
  propTypes: {
    blocks: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);
    let contents = [];

    if (props.blocks && props.blocks.length) {
      contents = _.map(props.blocks, block => <TextStreamBlock key={block.id} {...props} {...block}/>);
    } else {
      contents.push(<EmptySuggestion label="Run a command."/>);
    }

    return <div className={className.join(' ')}>{contents}</div>;
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
