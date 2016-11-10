import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'HistoryList',
  propTypes: {
    filter: React.PropTypes.string.isRequired,
    history: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      history = _.filter(props.history, item => !props.filter || item.text.indexOf(props.filter) > -1);

    return (
      <div className={className.join(' ')}>
        <table className="table">
          <tbody>
          {_.map(history, (item, index) => <tr key={item.id || index}><td><pre>{item.text}</pre></td></tr>)}
          </tbody>
        </table>
      </div>
    );
  }
});
