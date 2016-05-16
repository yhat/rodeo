import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  // pick the first terminal (we can add more later to this view?)
  return _.head(state.terminals) || {};
}

/**
 * @class PackagesViewer
 * @extends ReactComponent
 * @property {object} props
 */
export default connect(mapStateToProps)(React.createClass({
  displayName: 'PackagesViewer',
  propTypes: {
    filter: React.PropTypes.string,
    hasJupyterInstalled: React.PropTypes.bool,
    packages: React.PropTypes.array,
    version: React.PropTypes.string
  },
  render: function () {
    const props = this.props,
      packages = _.filter(props.packages, item => !props.filter || item.name.indexOf(props.filter) > -1);

    return (
      <div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>{'package'}</th>
              <th>{'version'}</th>
            </tr>
          </thead>
          <tbody>
          {_.map(packages, item => <tr key={item.name}><td>{item.name}</td><td>{item.version}</td></tr>)}
          </tbody>
        </table>
      </div>
    );
  }
}));
