import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  // pick the first terminal (we can add more later to this view?)
  return _.pick(_.head(state.terminals) || {}, ['history']);
}

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default connect(mapStateToProps)(React.createClass({
  displayName: 'HistoryViewer',
  propTypes: {
    filter: React.PropTypes.string,
    history: React.PropTypes.array
  },
  getDefaultProps: function () {
    return {
      filter: ''
    };
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
