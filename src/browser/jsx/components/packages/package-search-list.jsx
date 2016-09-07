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
  handleSearchKeyPress: function () {
    this.props.onSearchByTerm(this.props.searchValue);
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)],
      contents = [];

    if (props.className) {
      className.push(props.className);
    }

    contents.push(
      <header className="input-group">
        <input className="form-control" onChange={this.handleSearchValueChange} ref="search" value={props.searchValue} />
        <span className="input-group-btn">
          <button className="btn btn-default" onClick={_.partial(props.onSearchByTerm, props.searchValue)}>
            {'Search'}
          </button>
        </span>
      </header>
    );

    if (props.packages) {
      const list = _.filter(props.packages, item => !props.filter || item.name.indexOf(props.filter) > -1);

      if (props.packages.length === 0) {
        contents.push(<span>{'No packages found'}</span>);
      } else if (list.length === 0) {
        contents.push(<span>{'Filtered by "' + props.filter + '"'}</span>);
      } else {
        if (props.limit) {
          contents.push(<div>{'Showing ' + props.limit + ' of ' + props.size  + ' found packages'}</div>);
        }

        contents.push(<div>{_.map(list, item => {
          if (!item.downloads) {
            return <PackageSearchItem {...props} {...item} />;
          } else {
            return <PackageSearchItemDetails {...props} {...item} />;
          }
        })}</div>);
      }
    }

    return <div className={className.join(' ')}>{contents}</div>;
  }
});
