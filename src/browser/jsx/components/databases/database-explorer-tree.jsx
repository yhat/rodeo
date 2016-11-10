import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import TreeView from '../tree-view/tree-view';
import DatabaseExplorerTreeHeader from './database-explorer-tree-header.jsx';
import './database-explorer-tree.css';

let clickTimer;

export default React.createClass({
  displayName: 'DatabaseExplorerTree',
  propTypes: {
    items: React.PropTypes.array,
    onContractItem: React.PropTypes.func.isRequired,
    onExpandItem: React.PropTypes.func.isRequired,
    onOpenItem: React.PropTypes.func.isRequired
  },
  handleCaretClick: function (path, event) {
    event.preventDefault();

    const props = this.props,
      lastItem = _.last(path);

    if (lastItem) {
      if (lastItem.expanded) {
        props.onContractItem(path);
      } else {
        props.onExpandItem(path);
      }
    }
  },
  handleLabelClick: function (path, event) {
    event.preventDefault();

    const props = this.props,
      lastItem = _.last(path);

    if (lastItem && lastItem.expandable) {
      if (!clickTimer) {
        clickTimer = setTimeout(function () {
          clickTimer = null;
          if (lastItem.expanded) {
            props.onContractItem(path);
          } else {
            props.onExpandItem(path);
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
    const item = _.last(path);

    this.props.onOpenItem(item);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className}>
        <TreeView
          items={props.items}
          onCaretClick={this.handleCaretClick}
          onLabelClick={this.handleLabelClick}
          onLabelDoubleClick={this.handleLabelDoubleClick}
          sort=""
        />
      </div>
    );
  }
});
