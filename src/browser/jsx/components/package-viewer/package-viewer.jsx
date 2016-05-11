import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import PackageViewerRow from './package-viewer-row.jsx';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  // pick the first terminal (we can add more later to this view?)
  return _.head(state.terminals) || {};
}

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onInstallPython: _.noop
  };
}

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'PackagesViewer',
  propTypes: {
    hasJupyterInstalled: React.PropTypes.bool,
    onInstallPython: React.PropTypes.func,
    packages: React.PropTypes.array,
    version: React.PropTypes.string
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
      packages = _.filter(props.packages, item => !state.filter || item.name.indexOf(state.filter) > -1);

    return (
      <div>
        <div className="row">
          <div className="col-sm-4">
            <button className="btn btn-primary btn-xs" onClick={props.onInstallPython}>
              <span className="fa fa-download">{'Install Package'}</span>
            </button>
          </div>
          <div className="col-sm-5 col-sm-offset-3">
            <div className="input-group">
              <div className="input-group-addon">
                <span className="fa fa-search"/>
              </div>
              <input
                className="form-control input-sm"
                onChange={this.handleFilterChange}
                placeholder="(i.e. pandas, Flask)"
                ref="filter"
              />
            </div>
          </div>
        </div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>{'package'}</th>
              <th>{'version'}</th>
            </tr>
          </thead>
          <tbody id="packages-rows">
          {_.map(packages, item => <PackageViewerRow key={item.name} {...item}/>)}
          </tbody>
        </table>
      </div>
    );
  }
}));
