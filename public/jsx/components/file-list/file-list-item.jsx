import React from 'react';

export default React.createClass({
  displayName: 'FileListItem',
  propTypes: {
    filename: React.PropTypes.string.isRequired,
    isDirectory: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    onContextMenu: React.PropTypes.func
  },
  render: function () {
    const isDirectory = !!this.props.isDirectory,
      className = ['fa',
        isDirectory ? 'fa-folder' : 'fa-file-o'
      ].join(' ');

    return (
      <div className="list-group-item" onClick={this.props.onClick} onContextMenu={this.props.onContextMenu} >
        <span className={className}>{this.props.filename}</span>
      </div>
    );
  }
});