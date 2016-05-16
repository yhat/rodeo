import _ from 'lodash';
import {connect} from 'react-redux';
import React from 'react';
import FileList from '../../components/file-list/file-list.jsx';
import FileListItem from '../../components/file-list/file-list-item.jsx';
import fileViewerActions from './file-viewer.actions.js';

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
    files: React.PropTypes.array.isRequired,
    filter: React.PropTypes.string.isRequired,
    id: React.PropTypes.string,
    onRefresh: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    path: React.PropTypes.string.isRequired
  },
  getDefaultProps: function () {
    return {
      onRefresh: _.noop,
      onSelect: _.noop,
      path: '~',
      filter: ''
    };
  },
  componentDidMount: function () {
    const props = this.props;

    console.log('file-viewer', props.path, props);

    this.props.onRefresh(props.path);
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
