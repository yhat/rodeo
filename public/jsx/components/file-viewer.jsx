import React from 'react';
import FileList from './file-list.jsx';
import FileListItem from './file-list-item.jsx';
import * as store from '../services/store';
import * as ipc from '../services/ipc';

export default React.createClass({
  displayName: 'FileViewer',
  getInitialState() {
    const facts = store.get('systemFacts'),
      homedir = facts && facts.homedir;

    return {
      currentDirectory: store.get('workingDirectory') || homedir
    };
  },
  componentDidMount: function () {
    const currentDirectory = this.state.currentDirectory;

    ipc.send('files', currentDirectory).then(function (files) {
      this.setState({files});
    }.bind(this)).catch(function (error) {
      console.error(error);
    });
  },
  render: function () {
    let fileItems;

    if (this.state.files) {
      fileItems = this.state.files.map(function (file, i) {
        return <FileListItem filename={file.filename} isDirectory={file.isDirectory} key={i} />;
      });
    }

    return (
      <div>
        <div className="list-group" id="working-directory"></div>
        <FileList basePath={this.state.currentDirectory}>
          <FileListItem filename=".." />
          {fileItems}
        </FileList>
      </div>
    );
  }
});