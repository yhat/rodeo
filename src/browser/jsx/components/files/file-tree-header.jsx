import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './file-tree-header.css';

/**
 * @class FileList
 * @description Visual representation of the chrome around a list of files. Can show parent, sorts files by directory/file.
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FileTreeHeader',
  propTypes: {
    onGoToParent: React.PropTypes.func.isRequired
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className}>
        <div className="item" onClick={props.onGoToParent}><span className="fa fa-arrow-left"/><span>{'Go To Parent'}</span></div>
      </div>
    );
  }
});
