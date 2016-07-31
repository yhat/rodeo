import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import AcePane from '../../components/ace-pane/ace-pane.jsx';
import { getParentNodeOf } from '../../services/dom';
import editorTabGroupActions from '../../containers/editor-tab-group/editor-tab-group.actions';
import dialogActions from '../../actions/dialogs';
import kernelActions from '../../actions/kernel';
import terminalActions from '../terminal-tab-group/terminal-tab-group.actions';

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
 * @param {object} state  New state after an action occurred
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapStateToProps(state, ownProps) {
  return _.find(state.editorTabGroups, {groupId: ownProps.id});
}

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onAddAcePane: () => dispatch(editorTabGroupActions.addFile()),
    onInterrupt: () => dispatch(terminalActions.interrupt()),
    onFocusTab: (id) => dispatch(editorTabGroupActions.focusFile(id)),
    onLiftText: (text, context) => dispatch(terminalActions.addInputText(context)),
    onOpenPreferences: () => dispatch(dialogActions.showPreferences()),
    onRemoveAcePane: (id) => dispatch(editorTabGroupActions.closeFile(id)),
    onRunActiveAcePane: () => dispatch(kernelActions.executeActiveFileInActiveConsole()),
    onRunActiveAcePaneSelection: () => dispatch(kernelActions.executeActiveFileSelectionInActiveConsole()),
    onRodeo: () => dispatch(dialogActions.showAboutRodeo())
  };
}

/**
 * @class FreeTabGroup
 * @extends ReactComponent
 * @property props
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'FreeTabGroup',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    tabs: React.PropTypes.array.isRequired
  },
  getDefaultProps: function () {
    return {
      onAddAcePane: _.noop,
      onInterrupt: _.noop,
      onFocusTab: _.noop,
      onLiftText: _.noop,
      onOpenPreferences: _.noop,
      onRemoveAcePane: _.noop,
      onRunActiveAcePane: _.noop,
      onRodeo: _.noop
    };
  },
  shouldComponentUpdate: function (nextProps) {
    const props = this.props;

    // if the references changed, then some item has changed and needs a re-render
    return (props.active !== nextProps.active) ||
      (props.disabled !== props.disabled) ||
      (props.items !== nextProps.items);
  },
  handleTabClick: function (id) {
    const props = this.props;

    console.log('editorTabGroup', 'handleTabClick', arguments);
    props.onFocusTab(id);
  },
  handleTabClose: function (id) {
    const props = this.props,
      items = props.items,
      targetPane = _.find(items, {id});

    props.onRemoveAcePane(targetPane.id);
  },
  /**
   * NOTE: preventDefault to reject drag
   * @param {MouseEvent} event
   * @param {string} id
   */
  handleTabDragStart: function (event, id) {
    const el = getParentNodeOf(event.target, 'li'),
      item = _.find(this.props.items, {id});

    if (item && item.filename) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', el.outerHTML);
      event.dataTransfer.setData('text/uri-list', item.filename);  // used by outside file system viewers
      event.dataTransfer.setData('text/plain', item.filename);  //  used by outside file system viewers
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
      items = props.items,
      targetAcePane = _.find(items, {id: targetId}),
      sourceId = event.dataTransfer.getData('rodeo/cid'),
      sourceAcePane = _.find(items, {id: sourceId});

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
        'ace-pane': options => (
          <AcePane
            disabled={props.disabled}
            onInterrupt={props.onInterrupt}
            onLiftFile={props.onRunActiveAcePane}
            onLiftSelection={props.onLiftText}
            onOpenPreferences={props.onOpenPreferences}
            options={options}
          />
        )
      };

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
      >
        <li><a className="icon-overflowing not-tab" onClick={props.onRodeo}><span /></a></li>
        <li className="right">
          <a className="not-tab" onClick={props.onRunActiveAcePane} title={runScriptTitle}>
            <span className="fa fa-play-circle" />
            <span className="icon-text-right">{'Run Script'}</span>
          </a>
        </li>
        <li className="right">
          <a className="not-tab" onClick={props.onRunActiveAcePaneSelection} title={runLineTitle}>
            <span className="fa fa-play" />
            <span className="icon-text-right">{'Run Line'}</span>
          </a>
        </li>

        {props.items.map(function (item) {
          return (
            <TabbedPaneItem
              closeable
              icon={item.icon}
              id={item.id}
              key={item.id}
              label={item.label}
            >{types[item.contentType](item.options)}</TabbedPaneItem>
          );
        })}

        <li>
          <a className="not-tab" onClick={props.onAddAcePane}>
            <span className="fa fa-plus-square-o"/>
          </a>
        </li>

      </TabbedPane>
    );
  }
}));
