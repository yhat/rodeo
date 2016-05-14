import _ from 'lodash';
import {connect} from 'react-redux';
import React from 'react';
import FileList from '../../components/file-list/file-list.jsx';
import FileListItem from '../../components/file-list/file-list-item.jsx';
import fileViewerActions from './file-viewer.actions.js';
import './file-viewer.less';

function mapStateToProps(state) {
  return state.fileView;
}

function mapDispatchToProps(dispatch) {
  return {
    onRefresh: (filePath) => dispatch(fileViewerActions.getViewedFiles(filePath)),
    onClick: (file) => dispatch(fileViewerActions.selectViewedFile(file)),
    onOpenFile: (file) => dispatch(fileViewerActions.openViewedFile(file)),
    onGoToParentDirectory: (file) => dispatch(fileViewerActions.goToParentDirectory(file))
  };
}

/**
 * @class FileViewer
 * @extends ReactComponent
 * @property props
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'FileViewer',
  propTypes: {
    files: React.PropTypes.array,
    filter: React.PropTypes.string,
    id: React.PropTypes.string,
    onRefresh: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    path: React.PropTypes.string
  },
  getDefaultProps: function () {
    return {
      onRefresh: _.noop,
      onSelect: _.noop
    };
  },
  componentDidMount: function () {
    this.props.onRefresh(this.props.path);
  },
  render: function () {
    const props = this.props,
      files = _.filter(props.files, item => !props.filter || item.filename.indexOf(props.filter) > -1);

    return (
      <FileList onGoToParent={props.onGoToParentDirectory}>
        {files.map(file => {
          return (
            <FileListItem
              basePath={props.path}
              id={file.id}
              key={file.id}
              onClick={_.partial(props.onClick, file)}
              onDoubleClick={_.partial(props.onOpenFile, file)}
              {...file}
            />
          );
        })}
      </FileList>
    );
  }
}));
