import _ from 'lodash';
import React from 'react';
import './packages-list.css';

export default React.createClass({
  displayName: 'PackagesList',
  propTypes: {
    className: React.PropTypes.string,
    filter: React.PropTypes.string.isRequired,
    onDetectPackages: React.PropTypes.func.isRequired,
    packages: React.PropTypes.object.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)],
      list = _.filter(props.packages.list, item => !props.filter || item.name.indexOf(props.filter) > -1),
      contents = [];

    if (props.className) {
      className.push(props.className);
    }

    if (list.length === 0) {
      contents.push(
        <div className="package-actions">
          <button className="btn btn-sm btn-default" onClick={props.onDetectPackages}>
            <span className="fa fa-search"/>{'Detect Packages'}</button>
        </div>
      );
    } else {
      contents.push(
        <table className="table table-bordered">
          <thead>
          <tr>
            <th>{'package'}</th>
            <th>{'version'}</th>
          </tr>
          </thead>
          <tbody>
          {_.map(list, item => <tr key={item.name}>
            <td>{item.name}</td>
            <td>{item.version}</td>
          </tr>)}
          </tbody>
        </table>
      );
      contents.push(
        <div className="package-actions">
          <button className="btn btn-sm btn-default" onClick={props.onDetectPackages}>
            <span className="fa fa-refresh"/>{'Refresh List'}
          </button>
        </div>
      );
    }

    return <div className={className.join(' ')}>{contents}</div>;
  }
});
