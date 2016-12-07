import _ from 'lodash';
import React from 'react';
import FileListItem from './file-list-item.jsx';
import './file-list.css';

/**
 * @class FileList
 * @description Visual representation of the chrome around a list of files. Can show parent, sorts files by directory/file.
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FileList',
  propTypes: {
    id: React.PropTypes.string,
    onGoToSpecialDirectory: React.PropTypes.func
  },
  render: function () {
    const props = this.props;
    let parent,
      files = React.Children.toArray(props.children);

    files = _.filter(files, item => !props.filter || item.props.label.indexOf(props.filter) > -1);

    if (props.onGoToSpecialDirectory) {
      parent = (
        <FileListItem
          basePath={props.path}
          filename=".."
          key=".."
          onDoubleClick={props.onGoToSpecialDirectory}
        />
      );
    }

    return (
      <div className="file-list">
        {parent}
        {files.filter(file => file.props.isDirectory)}
        {files.filter(file => !file.props.isDirectory)}
      </div>
    );
  }
});
