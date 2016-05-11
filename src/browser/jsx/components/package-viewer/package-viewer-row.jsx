import React from 'react';

/**
 * @class PackagesViewer
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'PackagesViewer',
  render: function () {
    const props = this.props;

    return (
      <tr>
        <td>{props.name}</td>
        <td>{props.version}</td>
      </tr>
    );
  }
});
