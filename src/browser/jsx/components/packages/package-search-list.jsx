import _ from 'lodash';
import React from 'react';
import './packages-list.css';
import PackageSearchItem from './package-search-item.jsx';
import PackageSearchItemDetails from './package-search-item-detail.jsx';
import './package-search-list.css';

export default React.createClass({
  displayName: 'PackageSearchList',
  propTypes: {
    className: React.PropTypes.string,
    filter: React.PropTypes.string.isRequired,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onOpenExternal: React.PropTypes.func.isRequired,
    onSearchByTerm: React.PropTypes.func.isRequired,
    onSearchValueChange: React.PropTypes.func.isRequired,
    packages: React.PropTypes.array
  },
  shouldComponentUpdate: function (nextProps) {
    const props = this.props;

    return props.filter !== nextProps || _.isEqual(props.packages, nextProps.packages);
  },
  handleSearchValueChange: function (event) {
    const value = event.target.value;

    this.props.onSearchValueChange(value);
  },
  handleSearchKeyPress: function (event) {
    if (event.charCode == 13) {
      this.props.onSearchByTerm(this.props.searchValue);
    }
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)],
      contents = [];
    let searchButton;

    if (props.className) {
      className.push(props.className);
    }

    if (props.searching) {
      searchButton = <button className="btn btn-default" disabled>{'Search'}</button>;
    } else {
      searchButton = <button className="btn btn-default" onClick={_.partial(props.onSearchByTerm, props.searchValue)}>{'Search'}</button>;
    }

    contents.push(
      <header className="input-group" key="header">
        <input className="form-control" onChange={this.handleSearchValueChange} onKeyPress={this.handleSearchKeyPress} ref="search" value={props.searchValue} />
        <span className="button-shift">
          {searchButton}
        </span>
      </header>
    );

    if (props.searching) {
      contents.push(<div className="suggestion" key="suggestion"><span>{'Searching'}</span></div>);
    } else if (props.packages) {
      const list = _.filter(props.packages, item => !props.filter || item.name.indexOf(props.filter) > -1);

      if (props.packages.length === 0) {
        contents.push(<div className="suggestion" key="suggestion"><span>{'No packages found'}</span></div>);
      } else if (list.length === 0) {
        contents.push(<span key="filteredBy">{'Filtered by "' + props.filter + '"'}</span>);
      } else {
        if (props.limit) {
          contents.push(<div className="suggestion" key="limit">{'Showing ' + props.limit + ' of ' + props.size  + ' found packages'}</div>);
        }

        contents.push(<div key="contents">{_.map(list, item => {
          if (!item.downloads) {
            return <PackageSearchItem key={item.name} {...props} {...item} />;
          } else {
            return <PackageSearchItemDetails key={item.name} {...props} {...item} />;
          }
        })}</div>);
      }
    } else {
      contents.push(<div className="suggestion" key="suggestion"><span>{'Search for a package'}</span></div>);
    }

    return <div className={className.join(' ')}>{contents}</div>;
  }
});
