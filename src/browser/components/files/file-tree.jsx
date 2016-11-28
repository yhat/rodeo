import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import TreeView from '../tree-view/tree-view';
import FileTreeHeader from './file-tree-header.jsx';
import './file-tree.css';

const sorter = [item => !item.isDirectory, 'base'];

let clickTimer;

/**
 * @class FileList
 * @description Visual representation of the chrome around a list of files. Can show parent, sorts files by directory/file.
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FileTree',
  propTypes: {
    files: React.PropTypes.array,
    onContractFolder: React.PropTypes.func.isRequired,
    onExpandFolder: React.PropTypes.func.isRequired,
    onGoToSpecialDirectory: React.PropTypes.func.isRequired,
    onOpen: React.PropTypes.func.isRequired
  },
  handleCaretClick: function (path, event) {
    event.preventDefault();

    const props = this.props,
      lastItem = _.last(path);

    if (lastItem) {
      if (lastItem.expanded) {
        props.onContractFolder(path);
      } else {
        props.onExpandFolder(path);
      }
    }
  },
  handleLabelClick: function (path, event) {
    event.preventDefault();

    const props = this.props,
      lastItem = _.last(path);

    if (lastItem && lastItem.isDirectory) {
      if (!clickTimer) {
        clickTimer = setTimeout(function () {
          clickTimer = null;
          if (lastItem.expanded) {
            props.onContractFolder(path);
          } else {
            props.onExpandFolder(path);
          }
        }, 250);
      } else {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
    }
  },
  handleLabelDoubleClick: function (path, event) {
    event.preventDefault();
    const file = _.last(path);

    this.props.onOpenFile(file);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className}>
        <FileTreeHeader onGoToSpecialDirectory={props.onGoToSpecialDirectory}/>
        <TreeView
          items={props.files}
          onCaretClick={this.handleCaretClick}
          onLabelClick={this.handleLabelClick}
          onLabelDoubleClick={this.handleLabelDoubleClick}
          sort={sorter}
        />
      </div>
    );
  }
});
