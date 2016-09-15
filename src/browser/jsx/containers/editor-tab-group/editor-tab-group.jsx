import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import TabButton from '../../components/tabs/tab-button';
import TabAdd from '../../components/tabs/tab-add';
import TabOverflowImage from '../../components/tabs/tab-overflow-image';
import AcePane from '../../components/ace-pane/ace-pane.js';
import { getParentNodeOf } from '../../services/dom';
import editorTabGroupActions from '../../containers/editor-tab-group/editor-tab-group.actions';
import dialogActions from '../../actions/dialogs';
import kernelActions from '../../actions/kernel';
import terminalActions from '../terminal-tab-group/terminal-tab-group.actions';
import commonReact from '../../services/common-react';
import rodeoLogo from './rodeo-logo/rodeo-logo.4x.png';

/**
 * @param {Element} el
 */
function focusAcePaneInActiveElement(el) {
  const activeAcePane = el.querySelector('.active .ace-pane');

  if (activeAcePane) {
    AcePane.focusByElement(activeAcePane);
  }
}

/**
 * @param {function} dispatch
 * @param {object} ownProps
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId;

  return {
    onAddAcePane: () => dispatch(editorTabGroupActions.add(groupId)),
    onInterrupt: () => dispatch(terminalActions.interrupt()),
    onFocusTab: (id) => dispatch(editorTabGroupActions.focus(groupId, id)),
    onLiftText: (text, context) => dispatch(terminalActions.addInputText(context)),
    onOpenPreferences: () => dispatch(dialogActions.showPreferences()),
    onRemoveAcePane: (id) => dispatch(editorTabGroupActions.close(groupId, id)),
    onRunActiveAcePane: () => dispatch(kernelActions.executeActiveFileInActiveConsole()),
    onRunActiveAcePaneSelection: () => dispatch(kernelActions.executeActiveFileSelectionInActiveConsole()),
    onRodeo: () => dispatch(dialogActions.showAboutRodeo())
  };
}

/**
 * @class EditorTabGroup
 * @extends ReactComponent
 * @property props
 */
export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'EditorTabGroup',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool,
    groupId: React.PropTypes.string.isRequired,
    tabs: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate(nextProps) {
    console.log('EditorTabGroup', 'shouldComponentUpdate', !commonReact.shallowEqual(this, nextProps));
    return !commonReact.shallowEqual(this, nextProps);
  },
  handleTabClick: function (id, event) {
    const props = this.props;

    event.preventDefault();

    console.log('editorTabGroup', 'handleTabClick', arguments);
    props.onFocusTab(id);
  },
  handleTabClose: function (id, event) {
    const props = this.props,
      tabs = props.tabs,
      targetPane = _.find(tabs, {id});

    event.preventDefault();

    props.onRemoveAcePane(targetPane.id);
  },
  /**
   * NOTE: preventDefault to reject drag
   * @param {MouseEvent} event
   * @param {string} id
   */
  handleTabDragStart: function (event, id) {
    const el = getParentNodeOf(event.target, 'li'),
      tab = _.find(this.props.tabs, {id});

    if (tab && tab.filename) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', el.outerHTML);
      event.dataTransfer.setData('text/uri-list', tab.filename);  // used by outside file system viewers
      event.dataTransfer.setData('text/plain', tab.filename);  //  used by outside file system viewers
    } else {
      // prevent default in this case means to _deny_ the start of the drag
      event.preventDefault();
    }
  },
  /**
   * NOTE: preventDefault to allow drop
   * @param {MouseEvent} event
   */
  handleTabListDragOver: function (event) {
    const textUriList = event.dataTransfer.getData('text/uri-list'),
      textPlain = event.dataTransfer.getData('text/plain');

    if (textUriList && textPlain) {
      event.preventDefault();
    }
  },
  handleTabListDrop: function (event) {
    const targetEl = getParentNodeOf(event.target, 'li'),
      targetId = targetEl && targetEl.getAttribute('data-child'),
      props = this.props,
      tabs = props.tabs,
      targetAcePane = _.find(tabs, {id: targetId}),
      sourceId = event.dataTransfer.getData('rodeo/cid'),
      sourceAcePane = _.find(tabs, {id: sourceId});

    console.log('handleTabListDrop', {targetAcePane, sourceAcePane});
  },
  handleTabListDragEnter: function (event) {
    // accept all
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  },
  handleTabListDragLeave: function (event) {
    console.log('handleTabListDragLeave', event);
  },
  handleTabDragEnd: function (event) {
    console.log('handleTabListDragEnd', event);
  },
  render: function () {
    const props = this.props,
      runLineTitle = process.platform === 'darwin' ? '⌘ + Enter' : 'Alt + Enter',
      runScriptTitle = process.platform === 'darwin' ? '⌘ + Shift + Enter' : 'Alt + Shift + Enter',
      types = {
        'ace-pane': content => (
          <AcePane
            disabled={props.disabled}
            onInterrupt={props.onInterrupt}
            onLiftFile={props.onRunActiveAcePane}
            onLiftSelection={props.onLiftText}
            onOpenPreferences={props.onOpenPreferences}
            {...content}
          />
        )
      };

    console.log('EditorTabGroup', 'render', props);

    return (
      <TabbedPane
        focusable={!props.disabled}
        onTabClick={this.handleTabClick}
        onTabClose={this.handleTabClose}
        onTabDragEnd={this.handleTabDragEnd}
        onTabDragStart={this.handleTabDragStart}
        onTabListDragEnter={this.handleTabListDragEnter}
        onTabListDragLeave={this.handleTabListDragLeave}
        onTabListDragOver={this.handleTabListDragOver}
        onTabListDrop={this.handleTabListDrop}
        ref="editorTabs"
        {...props}
      >
        <TabOverflowImage onClick={props.onRodeo} src={rodeoLogo}/>
        <TabButton className="right" icon="play-circle" label="Run Script" onClick={props.onRunActiveAcePane} title={runScriptTitle}/>
        <TabButton className="right" icon="play" label="Run Line" onClick={props.onRunActiveAcePaneSelection} title={runLineTitle}/>

        {props.tabs.map(function (tab) {
          return (
            <TabbedPaneItem
              closeable
              icon={tab.icon}
              id={tab.id}
              key={tab.id}
              label={tab.label}
            >{types[tab.contentType](tab.content)}</TabbedPaneItem>
          );
        })}

        <TabAdd onClick={props.onAddAcePane} />
      </TabbedPane>
    );
  }
}));
