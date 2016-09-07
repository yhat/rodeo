import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import './package-search-item.css';

export default React.createClass({
  displayName: 'PackageSearchItem',
  propTypes: {
    className: React.PropTypes.string,
    onInstallPackage: React.PropTypes.func.isRequired,
    onShowMore: React.PropTypes.func.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)];

    if (props.className) {
      className.push(props.className);
    }

    // the sidebar is floating, and this is needed.  Bad because CSS shouldn't be interfering here.
    className.push('clearfix');

    function getDetailRows(target, property, label) {
      const rows = [];

      if (target[property]) {
        rows.push(<tr><td>{label}</td></tr>);
        rows.push(<tr><td className="package-sidebar-value">{target[property]}</td></tr>);
      }

      return rows;
    }

    return (
      <div className={className.join(' ')}>
        <div>
          <span className="package-name">{props.name}</span>
          <span className="package-version">{props.version}</span>
        </div>
        <div className="package-content">
          <div className="package-sidebar">
            <section className="package-downloads">
              <header>{'Downloads'}</header>
              <table>
                <tbody>
                  <tr><td>{'Last Day'}</td><td className="package-sidebar-value">{props.downloads.last_day}</td></tr>
                  <tr><td>{'Last Week'}</td><td className="package-sidebar-value">{props.downloads.last_week}</td></tr>
                  <tr><td>{'Last Month'}</td><td className="package-sidebar-value">{props.downloads.last_month}</td></tr>
                </tbody>
              </table>
            </section>
            <section className="package-details">
              <header>{'Details'}</header>
              <table>
                <tbody>
                {getDetailRows(props, 'license', 'License')}
                {getDetailRows(props, 'platform', 'Platform')}
                {getDetailRows(props, 'package_url', 'Package Url')}
                {getDetailRows(props, 'home_page', 'Home Page')}
                {getDetailRows(props, 'docs_url', 'Documentation')}
                {getDetailRows(props, 'bugtrack_url', 'Bug Tracking')}
                </tbody>
              </table>
            </section>
            <section>
              <button className="btn btn-primary" onClick={_.partial(props.onInstallPackage, props.name, props.version)}>
                {'Install Package'}
              </button>
            </section>
          </div>
          <div className="package-summary">{props.summary}</div>
          <div className="package-description">
            {props.isLikelyMarkdown ? <Marked></Marked> : <div className="restructuredtext">{props.description}</div>}
          </div>
        </div>
      </div>
    );
  }
});
