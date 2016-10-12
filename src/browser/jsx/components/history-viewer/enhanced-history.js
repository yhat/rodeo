import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './enhanced-history.css';
import EnhancedHistoryBlock from './enhanced-history-block';
import EmptySuggestion from '../empty/empty-suggestion';

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'EnhancedHistory',
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
      contents = _.map(props.blocks, block => <EnhancedHistoryBlock key={block.id} {...props} {...block}/>);
    } else {
      contents.push(<EmptySuggestion label="Run a command."/>);
    }

    return <div className={className.join(' ')}>{contents}</div>;
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
