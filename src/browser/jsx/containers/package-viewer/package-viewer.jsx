import React from 'react';
import {connect} from 'react-redux';
import actions from './package-viewer.actions';
import PackageList from '../../components/packages/packages-list.jsx';

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onDetectPackages: () => dispatch(actions.detectPackages())
  };
}

/**
 * @class PackagesViewer
 * @extends ReactComponent
 * @property {object} props
 */
export default connect(state => state, mapDispatchToProps)(React.createClass({
  displayName: 'PackagesViewer',
  propTypes: {
    filter: React.PropTypes.string,
    packages: React.PropTypes.object
  },
  render: function () {
    return <PackageList {...this.props}/>;
  }
}));
