import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import TabbedPane from '../../components/tabs/tabbed-pane.js';
import TabbedPaneItem from '../../components/tabs/tabbed-pane-item.js';
import TabButton from '../../components/tabs/tab-button';
import TabAdd from '../../components/tabs/tab-add';
import TabOverflowImage from '../../components/tabs/tab-overflow-image';
import AcePane from '../../components/ace-pane/ace-pane';
import GrayInfo from '../../components/gray-info/gray-info';
import GrayInfoSelect from '../../components/gray-info/gray-info-select';
import { getParentNodeOf } from '../../services/dom';
import actions from '../../containers/editor-tab-group/editor-tab-group.actions';
import dialogActions from '../../actions/dialogs';
import commonReact from '../../services/common-react';
import rodeoLogo from './rodeo-logo/rodeo-logo.4x.png';
import './editor-tab-group.css';
import editorCommands from './editor-commands.yml';
import aceActions from './ace.actions';

/**
 * @param {function} dispatch
 * @param {object} ownProps
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId;

  return {
    onAddAcePane: () => dispatch(actions.add(groupId)),
    onFocusTab: id => dispatch(actions.focus(groupId, id)),
    onLoadError: tab => dispatch(actions.handleLoadError(groupId, tab)),
    onLoading: tab => dispatch(actions.handleLoading(groupId, tab)),
    onLoaded: tab => dispatch(actions.handleLoaded(groupId, tab)),
    onRemoveAcePane: id => dispatch(actions.close(groupId, id)),
    onAceCommand: (id, command, editor) => dispatch(actions.executeAceCommand(groupId, id, command, editor)),
    onExecuteSelection: id => dispatch(actions.triggerAceCommand(groupId, id, ['executeSelection', 'selectJupyterBlock'])),
    onExecuteFile: id => dispatch(actions.triggerAceCommand(groupId, id, 'executeFile')),
    onExecute: (id, context) => dispatch(actions.execute(groupId, id, context)),
    onRodeo: () => dispatch(dialogActions.showAboutRodeo()),
    onTabModeChange: (tab, option) => dispatch(actions.changeTabMode(groupId, tab.id, option)),
    onUnsavedWorkPreventedClose: () => dispatch(actions.unsavedWorkPreventedClose(groupId))
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
  componentDidMount() {
    window.addEventListener('beforeunload', this.handleWindowClose);
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleWindowClose);
  },
  handleWindowClose() {
    // if anything unsaved, prevent close
    // this.props.onUnsavedWorkPreventedClose();
    //
    // return false;
  },
  handleTabClick(id, event) {
    event.preventDefault();
    this.props.onFocusTab(id);
  },
  handleTabClose(id, event) {
    event.preventDefault();
    this.props.onRemoveAcePane(id);
  },
  /**
   * NOTE: preventDefault to reject drag
   * @param {string} id
   * @param {MouseEvent} event
   */
  handleTabDragStart(id, event) {
    const el = getParentNodeOf(event.target, 'li'),
      tab = _.find(this.props.tabs, {id});

    if (tab && tab.content.filename) {
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
  handleTabListDragOver(event) {
    const textUriList = event.dataTransfer.getData('text/uri-list'),
      textPlain = event.dataTransfer.getData('text/plain');

    if (textUriList && textPlain) {
      event.preventDefault();
    }
  },
  handleTabListDrop(event) {
    const targetEl = getParentNodeOf(event.target, 'li'),
      targetId = targetEl && targetEl.getAttribute('data-child'),
      props = this.props,
      tabs = props.tabs,
      targetAcePane = _.find(tabs, {id: targetId}),
      sourceId = event.dataTransfer.getData('rodeo/cid'),
      sourceAcePane = _.find(tabs, {id: sourceId});

    console.log('handleTabListDrop', {targetAcePane, sourceAcePane});
  },
  handleTabListDragEnter(event) {
    // accept all
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  },
  handleTabListDragLeave(event) {
    console.log('handleTabListDragLeave', event);
  },
  handleTabDragEnd(event) {
    console.log('handleTabListDragEnd', event);
  },
  handleFeatureClick: function (feature, activeTab, event) {
    event.preventDefault();
    event.stopPropagation();

    if (_.isFunction(this.props[feature.onClick])) {
      this.props[feature.onClick](activeTab.id);
    }
  },
  handleAceCommand(tabId, command, editor) {
    if (aceActions[command.name]) {
      return aceActions[command.name](this.props, tabId, command, editor);
    }
  },
  render() {
    const props = this.props,
      activeTab = _.find(props.tabs, {id: props.active}),
      types = {
        'ace-pane': tab => (
          <AcePane
            commands={editorCommands}
            disabled={props.disabled}
            onCommand={_.partial(this.handleAceCommand, tab.id)}
            onLoadError={props.onLoadError}
            onLoaded={props.onLoaded}
            onLoading={props.onLoading}
            {...tab.content}
          />
        )
      };
    let featuredActions = [];

    if (activeTab) {
      _.each(activeTab.featuredActions, feature => {
        if (feature.enabled === false || !_.isString(feature.onClick) || !_.isFunction(props[feature.onClick])) {
          featuredActions.push(<TabButton className="right disabled" key={feature.name} {...feature}/>);
        } else {
          featuredActions.push(<TabButton className="right" key={feature.name} {...feature} onClick={_.partial(this.handleFeatureClick, feature, activeTab)}/>);
        }
      });
    }

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
        {featuredActions}
        {props.tabs.map(tab => {
          return (
            <TabbedPaneItem key={tab.id} {...tab}>
              {types[tab.contentType](tab)}
              <GrayInfo content={tab.content}>
                <GrayInfoSelect
                  onChange={_.partial(props.onTabModeChange, tab)}
                  options={_.map(tab.syntaxHighlighters, knownFileType => _.assign({value: knownFileType.mode}, knownFileType))}
                  value={tab.content.mode}
                />
              </GrayInfo>
            </TabbedPaneItem>
          );
        })}
        <TabAdd onClick={props.onAddAcePane} />
      </TabbedPane>
    );
  }
}));
