import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import EmptySuggestion from '../empty/empty-suggestion';

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'EnhancedHistoryBlock',
  propTypes: {
    blocks: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      contents = [];

    return <div className={className.join(' ')}>{contents}</div>;
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
