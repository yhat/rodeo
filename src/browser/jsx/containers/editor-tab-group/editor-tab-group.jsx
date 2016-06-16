import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabbed-pane/tabbed-pane.jsx';
import TabbedPaneItem from '../../components/tabbed-pane/tabbed-pane-item.jsx';
import AcePane from '../../components/ace-pane/ace-pane.jsx';
import { getParentNodeOf } from '../../services/dom';
import editorTabGroupActions from '../../containers/editor-tab-group/editor-tab-group.actions';
import dialogActions from '../../actions/dialogs';
import kernelActions from '../../actions/kernel';
import terminalActions from '../terminal/terminal.actions';

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
    disabled: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    items: React.PropTypes.array.isRequired
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
  handleTabClose: function (tabId) {
    const props = this.props,
      items = props.items,
      targetPane = _.find(items, {tabId});

    props.onRemoveAcePane(targetPane.id);
  },
  handleTabChanged: function (oldTabId, tabId) {
    // todo: remove 'refs', we can find it by id instead
    // find the active ace-pane, and focus on it
    const props = this.props,
      items = props.items,
      editorTabs = ReactDOM.findDOMNode(this.refs.editorTabs),
      newPane = _.find(items, {tabId});

    props.onFocusTab(newPane.id);

    // if there is an active editor tab, focus on the ace pane inside of it
    focusAcePaneInActiveElement(editorTabs);
  },
  /**
   * NOTE: preventDefault to reject drag
   * @param {MouseEvent} event
   * @param {string} tabId
   */
  handleTabDragStart: function (event, tabId) {
    const el = getParentNodeOf(event.target, 'li'),
      item = _.find(this.props.items, {tabId});

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

    console.log('drop', {sourceAcePane, targetAcePane});
  },
  handleTabListDragEnter: function (event) {
    // accept all
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  },
  render: function () {
    const props = this.props,
      items = props.items,
      types = {
        'ace-pane': item => (
          <AcePane
            disabled={props.disabled}
            key={item.id}
            onInterrupt={props.onInterrupt}
            onLiftFile={props.onRunActiveAcePane}
            onLiftSelection={props.onLiftText}
            onOpenPreferences={props.onOpenPreferences}
            {...item}
          />
        )
      };

    return (
      <TabbedPane
        focusable={props.disabled}
        onChanged={this.handleTabChanged}
        onTabClose={this.handleTabClose}
        onTabDragStart={this.handleTabDragStart}
        onTabListDragEnter={this.handleTabListDragEnter}
        onTabListDragOver={this.handleTabListDragOver}
        onTabListDrop={this.handleTabListDrop}
        ref="editorTabs"
      >
        <li><a className="icon-overflowing not-tab" onClick={props.onRodeo}><span /></a></li>
        <li className="right">
          <a className="not-tab" onClick={props.onRunActiveAcePane} title="Run script">
            <span className="fa fa-play-circle" />
            <span className="icon-text-right">{'Run Script'}</span>
          </a>
        </li>

        {items.map(function (item) {
          return (
            <TabbedPaneItem hasFocus={item.hasFocus} icon={item.icon} id={item.tabId} isCloseable key={item.id} label={item.label}>
              {types[item.contentType](item)}
            </TabbedPaneItem>
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
