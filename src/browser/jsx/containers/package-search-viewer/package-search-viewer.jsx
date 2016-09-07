import _ from 'lodash';
import React from 'react';
import PackageSearchList from '../../components/packages/package-search-list.jsx';
import {connect} from 'react-redux';
import actions from './package-search-viewer.actions';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  return state.packageSearch;
}

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onInstallPackage: (packageName, version) => dispatch(actions.installPackage(packageName, version)),
    onShowMore: (packageName, version) => dispatch(actions.showMore(packageName, version)),
    onList: () => dispatch(actions.list()),
    onSearchValueChange: value => dispatch(actions.changeSearchValue(value)),
    onSearchByTerm: term => dispatch(actions.searchByTerm(term))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'PackageSearchViewer',
  render: function () {
    return <PackageSearchList {...this.props} />;
  }
}));
