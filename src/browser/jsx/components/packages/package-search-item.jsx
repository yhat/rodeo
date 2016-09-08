import _ from 'lodash';
import React from 'react';
import './package-search-item.css';

export default React.createClass({
  displayName: 'PackageSearchItem',
  propTypes: {
    className: React.PropTypes.string,
    onShowMore: React.PropTypes.func.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)];
    let moreButton, summary, recommended;

    if (props.className) {
      className.push(props.className);
    }

    if (props.loading) {
      moreButton = <button className="btn btn-default" disabled>{'More'}</button>;
    } else {
      moreButton = (
        <button className="btn btn-default" onClick={_.partial(props.onShowMore, props.name, props.version)}>
          {'More'}
        </button>
      );
    }

    if (props.summary) {
      summary = <div className="package-summary">{props.summary}</div>;
    } else {
      summary = <div className="package-summary missing">{'No summary'}</div>;
    }

    if (props.recommended) {
      recommended = <span className="package-recommended"><span className="fa fa-star" /></span>;
    }

    return (
      <div className={className.join(' ')}>
        <div>
          <span className="package-name">{props.name}</span>
          <span className="package-version">{props.version}</span>
          {recommended}
        </div>
        <div className="package-short-content">
          {summary}
          <div className="package-actions">{moreButton}</div>
        </div>
      </div>
    );
  }
});
