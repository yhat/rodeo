import _ from 'lodash';
import {connect} from 'react-redux';
import React from 'react';
import commonReact from '../../services/common-react';
import FileTree from '../../components/files/file-tree.jsx';
import fileViewerActions from './file-viewer.actions.js';

function mapStateToProps(state) {
  return state.fileView;
}

function mapDispatchToProps(dispatch) {
  return {
    onRefresh: (filePath) => dispatch(fileViewerActions.getViewedFiles(filePath)),
    onClick: (file) => dispatch(fileViewerActions.selectViewedFile(file)),
    onOpenFile: (file) => dispatch(fileViewerActions.openViewedFile(file)),
    onGoToSpecialDirectory: target => dispatch(fileViewerActions.goToSpecialDirectory(target)),
    onExpandFolder: indexPath => dispatch(fileViewerActions.expandFolder(indexPath)),
    onContractFolder: indexPath => dispatch(fileViewerActions.contractFolder(indexPath))
  };
}

function isDotFile(file) {
  return _.startsWith(file.base, '.');
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
    path: React.PropTypes.string.isRequired,
    showDotFiles: React.PropTypes.bool
  },
  getDefaultProps: function () {
    return {
      onRefresh: _.noop,
      onSelect: _.noop,
      path: '~',
      filter: '',
      showDotFiles: false
    };
  },
  componentDidMount: function () {
    const props = this.props;

    props.onRefresh();
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props;
    let files = props.files;

    if (props.filter) {
      files = _.filter(files, item => item.label.indexOf(props.filter) > -1);
    }

    if (!props.showDotFiles) {
      files = _.filter(files, file => !isDotFile(file));
    }

    return (
      <FileTree
        {...props}
        files={files}
      />
    );
  }
}));
