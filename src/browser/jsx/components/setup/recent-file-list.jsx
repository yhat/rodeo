import React from 'react';


/**
 * @class FileItem
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'FileItem',
  propTypes: {
    className: React.PropTypes.string,
    filename: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    lastModified: React.PropTypes.string,
    onClick: React.PropTypes.func,
    onDoubleClick: react.PropTypes.func
  },
  render: function () {
    return (
      <tr className="file-item-row" onClick={props.onClick} onDoubleClick={props.onDoubleClick}>
        <td>{props.label}</td>
        <td>{props.lastModified}</td>
      </tr>
    );
  }
});
