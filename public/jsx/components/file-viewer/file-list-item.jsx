import React from 'react';

const fileListItemClass = 'file-list-item',
  selectedClass = 'file-list-item-selected';

export default React.createClass({
  displayName: 'FileListItem',
  propTypes: {
    basePath: React.PropTypes.string.isRequired,
    filename: React.PropTypes.string.isRequired,
    isDirectory: React.PropTypes.bool,
    isSelected: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    onDoubleClick: React.PropTypes.func,
    onContextMenu: React.PropTypes.func
  },
  render: function () {
    const props = this.props,
      className = [
        fileListItemClass,
        props.isSelected ? selectedClass : ''
      ].join(' '),
      nameClassName = ['fa',
        props.isDirectory ? 'fa-folder' : 'fa-file-o'
      ].join(' ');

    return (
      <div className={className} onClick={props.onClick} onDoubleClick={props.onDoubleClick} onContextMenu={props.onContextMenu} >
        <span className={nameClassName}>{props.filename}</span>
      </div>
    );
  }
});