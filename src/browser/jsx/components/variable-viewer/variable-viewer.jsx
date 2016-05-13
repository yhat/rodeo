import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  // pick the first terminal (we can add more later to this view?)
  return _.pick(_.head(state.terminals) || {}, ['variables']);
}

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default connect(mapStateToProps)(React.createClass({
  displayName: 'HistoryViewer',
  propTypes: {
    variables: React.PropTypes.array
  },
  getInitialState: function () {
    return {
      filter: ''
    };
  },
  handleFilterChange: _.debounce(function () {
    const value = this.refs.filter.value;

    this.setState({filter: value ? value.toLowerCase() : ''});
  }, 300),
  render: function () {
    const props = this.props,
      state = this.state,
      items = _.filter(props.variables, item => !state.filter || item.text.indexOf(state.filter) > -1);

    return (
      <div>
        <div className="row">
          <div className="col-sm-5 col-sm-offset-7">
            <div className="input-group">
              <div className="input-group-addon">
                <span className="fa fa-search"/>
              </div>
              <input
                className="form-control input-sm"
                onChange={this.handleFilterChange}
                ref="filter"
              />
            </div>
          </div>
        </div>
        <table className="table table-bordered">
          <thead>
          <tr>
            <th>{'executed'}</th>
          </tr>
          </thead>
          <tbody>
          {_.map(items, item => <tr key={item.id}><td><pre>{item.text}</pre></td></tr>)}
          </tbody>
        </table>
      </div>
    );
  }
}));
