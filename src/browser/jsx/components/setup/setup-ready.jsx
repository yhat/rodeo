import React from 'react';
import FileList from '../file-list/file-list.jsx';
import FileListItem from '../file-list/file-list-item.jsx';
import * as store from '../../services/store';

/**
 * @class SetupReady
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'SetupReady',
  propTypes: {
    onReady: React.PropTypes.func.isRequired
  },
  render: function () {
    let files,
      recentFiles = store.get('recentFiles') || [];

    if (recentFiles) {
      files = (
        <FileList>
          {recentFiles.map((file) => <FileListItem {...file}/>)}
        </FileList>
      );
    } else {
      files = <div>{'No Recent Files.'}</div>;
    }

    return (
      <div className="setup-ready container">
        <div>
          <h2>{'Ready to Rodeo!'}</h2>
          <p>
            <a onClick={this.props.onReady}>{'Yeeeeeeeehah!'}</a>
          </p>
        </div>
        {files}
      </div>
    );
  }
});
