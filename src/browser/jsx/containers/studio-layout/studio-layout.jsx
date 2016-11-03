import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import SplitPane from '../../components/split-pane/split-pane.jsx';
import EditorTabGroup from '../../containers/editor-tab-group/editor-tab-group.jsx';
import FreeTabGroup from '../../containers/free-tab-group/free-tab-group.jsx';
import commonReact from '../../services/common-react';

export default connect(state => state)(React.createClass({
  displayName: 'StudioLayout',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      isFocusable = !props.modalDialogs.length,
      topLeft = _.find(props.editorTabGroups, {groupId: 'top-left'}),
      bottomLeft = _.find(props.freeTabGroups, {groupId: 'bottom-left'}),
      topRight = _.find(props.freeTabGroups, {groupId: 'top-right'}),
      bottomRight = _.find(props.freeTabGroups, {groupId: 'bottom-right'});

    return (
      <SplitPane direction="left-right" id="split-pane-center">
        <SplitPane direction="top-bottom" id="split-pane-left">
          <EditorTabGroup focusable={isFocusable} {...topLeft}/>
          <FreeTabGroup focusable={isFocusable} {...bottomLeft}/>
        </SplitPane>
        <SplitPane direction="top-bottom" id="split-pane-right">
          <FreeTabGroup focusable={isFocusable} {...topRight}/>
          <FreeTabGroup focusable={isFocusable} {...bottomRight}/>
        </SplitPane>
      </SplitPane>
    );
  }
}));
