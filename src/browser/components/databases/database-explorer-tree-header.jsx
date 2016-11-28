import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './database-explorer-tree-header.css';

/**
 * @class FileList
 * @description Visual representation of the chrome around a list of files. Can show parent, sorts files by directory/file.
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FileTreeHeader',
  propTypes: {

  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className}>
        <div className="item"><span className="fa fa-arrow-left"/><span>{'Parent'}</span></div>
        <div className="item"><span className="fa fa-home"/><span>{'Home'}</span></div>
        <div className="item"><span className="fa fa-terminal"/><span>{'Working Directory'}</span></div>
      </div>
    );
  }
});
