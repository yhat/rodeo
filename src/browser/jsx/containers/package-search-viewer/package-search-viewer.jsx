import _ from 'lodash';
import React from 'react';
import PackageSearchList from '../../components/packages/package-search-list.jsx';

export default React.createClass({
  displayName: 'PackageSearchViewer',
  render: function () {
    return <PackageSearchList {...this.props} />;
  }
});
