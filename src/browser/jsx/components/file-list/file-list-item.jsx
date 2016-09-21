import _ from 'lodash';
import React from 'react';

const fileListItemClass = 'file-list-item',
  selectedClass = 'file-list-item-selected';

/**
 * @class FileListItem
 * @description Visual representation of a file in a list
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FileListItem',
  propTypes: {
    filename: React.PropTypes.string.isRequired,
    isDirectory: React.PropTypes.bool,
    isSelected: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    onContextMenu: React.PropTypes.func,
    onDoubleClick: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      onClick: _.noop,
      onContextMenu: _.noop,
      onDoubleClick: _.noop,
      isSelected: false,
      isDirectory: false
    };
  },
  render: function () {
    const props = this.props,
      className = [fileListItemClass, props.isSelected ? selectedClass : ''],
      iconClassName = ['fa', 'fa-before', props.isDirectory ? 'fa-folder' : 'fa-file-o'];

    return (
      <div className={className.join(' ')} onClick={props.onClick} onContextMenu={props.onContextMenu} onDoubleClick={props.onDoubleClick}>
        <span className={iconClassName.join(' ')} />
        <span className="font-sans">{props.filename}</span>
      </div>
    );
  }
});
