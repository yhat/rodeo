import _ from 'lodash';
import React from 'react';
import Marked from '../marked';
import './package-search-item.css';

function removeProtocolFromUrl(url) {
  return url.replace('http://', '').replace('https://', '');
}

export default React.createClass({
  displayName: 'PackageSearchItem',
  propTypes: {
    className: React.PropTypes.string,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onOpenExternal: React.PropTypes.func.isRequired,
    onShowMore: React.PropTypes.func.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)],
      onOpenExternal = this.props.onOpenExternal;
    let description, recommended;

    if (props.className) {
      className.push(props.className);
    }

    // the sidebar is floating, and this is needed.  Bad because CSS shouldn't be interfering here.
    className.push('clearfix');

    function getDetailRows(target, label, property, hrefProperty) {
      const rows = [];

      if (target[property]) {
        const propertyLabelKey = property + '-label',
          propertyValueKey = property + '-value',
          targetProperty = removeProtocolFromUrl(target[property]);

        rows.push(<tr key={propertyLabelKey}><td>{label}</td></tr>);
        if (hrefProperty && target[hrefProperty]) {
          rows.push(
            <tr key={propertyValueKey}><td className="package-sidebar-value">
              <a onClick={_.partial(onOpenExternal, target[hrefProperty])}>{targetProperty}</a>
            </td></tr>
          );
        } else {
          rows.push(<tr><td className="package-sidebar-value">{target[property]}</td></tr>);
        }
      }

      return rows;
    }

    if (props.description) {
      if (props.isLikelyMarkdown) {
        description = <Marked>{props.description}</Marked>;
      } else {
        description = <div className="restructuredtext">{props.description}</div>;
      }
    } else {
      description = <div className="suggestion"><span>{'No description'}</span></div>;
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
        <div className="package-content">
          <div className="package-sidebar">
            <section className="package-details">
              <header>{'Details'}</header>
              <table>
                <tbody>
                {getDetailRows(props, 'License', 'license')}
                {getDetailRows(props, 'Platform', 'platform')}
                {getDetailRows(props, 'Package Url', 'package_url', 'package_url')}
                {getDetailRows(props, 'Home Page', 'home_page', 'home_page')}
                {getDetailRows(props, 'Documentation', 'docs_url', 'docs_url')}
                {getDetailRows(props, 'Bug Tracking', 'bugtrack_url', 'bugtrack_url')}
                </tbody>
              </table>
            </section>
            <section>
              <button className="btn btn-primary" onClick={_.partial(props.onInstallPythonModule, props.name, props.version)}>
                {'Install Package'}
              </button>
            </section>
          </div>
          <div className="package-summary">{props.summary}</div>
          <div className="package-description">{description}</div>
        </div>
      </div>
    );
  }
});
