import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import commonReact from '../services/common-react';

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default connect()(React.createClass({
  displayName: 'HistoryViewer',
  propTypes: {
    filter: React.PropTypes.string.isRequired,
    history: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return !commonReact.shallowEqual(this, nextProps);
  },
  render: function () {
    const props = this.props,
      history = _.filter(props.history, item => !props.filter || item.text.indexOf(props.filter) > -1);

    return (
      <div>
        <table className="table table-bordered">
          <tbody>
          {_.map(history, item => <tr key={item.id}>
            <td>
              <pre>{item.text}</pre>
            </td>
          </tr>)}
          </tbody>
        </table>
      </div>
    );
  }
}));
