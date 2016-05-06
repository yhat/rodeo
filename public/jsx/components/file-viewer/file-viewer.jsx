import _ from 'lodash';
import {connect} from 'react-redux';
import React from 'react';
import FileListItem from './file-list-item.jsx';
import {selectViewedFile, getViewedFiles, openViewedFile, goToParentDirectory} from './file-viewer.actions';
import './file-viewer.less';

function mapStateToProps(state) {
  return state.fileView;
}

function mapDispatchToProps(dispatch) {
  return {
    onRefresh: (filePath) => dispatch(getViewedFiles(filePath)),
    onClick: (file) => dispatch(selectViewedFile(file)),
    onOpenFile: (file) => dispatch(openViewedFile(file)),
    onGoToParentDirectory: (file) => dispatch(goToParentDirectory(file))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'FileViewer',
  propTypes: {
    id: React.PropTypes.string,
    path: React.PropTypes.string,
    files: React.PropTypes.array,
    onRefresh: React.PropTypes.func,
    onSelect: React.PropTypes.func
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
    const props = this.props;

    return (
      <div>
        <div className="list-group" id="working-directory"></div>
        <div className="file-list">
          <FileListItem
            basePath={props.path}
            filename=".."
            key={0}
            onDoubleClick={props.onGoToParentDirectory}
          />
          {props.files.map(function (file) {
            return (
              <FileListItem
                basePath={props.path}
                key={file.id}
                onClick={_.partial(props.onClick, file)}
                onDoubleClick={_.partial(props.onOpenFile, file)}
                {...file}
              />
            );
          })}
        </div>
      </div>
    );
  }
}));