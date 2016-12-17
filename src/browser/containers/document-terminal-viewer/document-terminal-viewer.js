import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import commonReact from '../../services/common-react';
import DocumentTerminal from '../../components/document-terminal/document-terminal';
import DocumentTerminalHistory from '../../components/document-terminal/document-terminal-history';
import StickyBottomScroll from '../../components/document-terminal/sticky-bottom-scroll';
import PromptViewer from '../prompt-viewer/prompt-viewer';
import EmptySuggestion from '../../components/empty/empty-suggestion';
import TerminalError from '../../components/document-terminal/document-terminal-error';
import GrayInfo from '../../components/gray-info/gray-info';
import GrayInfoLink from '../../components/gray-info/gray-info-link';
import GrayInfoLinkList from '../../components/gray-info/gray-info-link-list';
import './document-terminal-viewer.css';
import selectionUtil from '../../services/selection-util';
import features from './features.yml';
import promptUtils from '../../services/util/prompt-util';
import actions from './document-terminal-viewer.actions';
import promptViewerActions from '../prompt-viewer/prompt-viewer.actions';

/**
 * @param {function} dispatch
 * @param {object} ownProps  Props given to this object from parent
 * @returns {object}
 */
function mapDispatchToProps(dispatch, ownProps) {
  const groupId = ownProps.groupId,
    id = ownProps.tabId;

  return {
    onAnnotationClick: props => dispatch(actions.clickAnnotation(groupId, id, props)),
    onAnnotationCopy: event => dispatch(actions.copyAnnotation(groupId, id, event)),
    onClear: () => dispatch(actions.clear(groupId, id)),
    onInstallPythonPackage: (name, version) => dispatch(actions.installPythonModule(groupId, id, name, version)),
    onInterrupt: () => dispatch(actions.interrupt(groupId, id)),
    onPromptAutocomplete: props => dispatch(actions.autocomplete(groupId, id, props)),
    onPromptCommand: command => dispatch(promptViewerActions.createCommand(groupId, id, command)),
    onPromptExecute: context => dispatch(actions.execute(groupId, id, context)),
    onPromptInput: context => dispatch(actions.input(groupId, id, context)),
    onRestart: () => dispatch(actions.restart(groupId, id)),
    onShowSelectWorkingDirectoryDialog: () => dispatch(actions.showSelectWorkingDirectoryDialog(groupId, id))
  };
}

export default connect(null, mapDispatchToProps)(React.createClass({
  displayName: 'DocumentTerminalViewer',
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onAnnotationBlur: React.PropTypes.func,
    onAnnotationClick: React.PropTypes.func.isRequired,
    onAnnotationCopy: React.PropTypes.func.isRequired,
    onAnnotationDrag: React.PropTypes.func,
    onAnnotationFocus: React.PropTypes.func,
    onAnnotationGoTo: React.PropTypes.func,
    onAnnotationSave: React.PropTypes.func,
    onClear: React.PropTypes.func,
    onInstallPythonPackage: React.PropTypes.func.isRequired,
    onInterrupt: React.PropTypes.func,
    onPromptAutocomplete: React.PropTypes.func.isRequired,
    onPromptBlur: React.PropTypes.func,
    onPromptCommand: React.PropTypes.func.isRequired,
    onPromptExecute: React.PropTypes.func.isRequired,
    onPromptFocus: React.PropTypes.func,
    onPromptInput: React.PropTypes.func.isRequired,
    onRestart: React.PropTypes.func,
    onShowSelectWorkingDirectoryDialog: React.PropTypes.func.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const el = event.currentTarget.querySelector('.prompt'),
      isSelectionClick = selectionUtil.isSelectionClick(window.getSelection());

    if (el && isSelectionClick) {
      el.focus();
      window.getSelection().collapse(el, 0);
    }
  },
  handleKeyDown(event) {
    const props = this.props,
      key = event.key,
      alt = event.altKey,
      ctrl = event.ctrlKey,
      meta = event.metaKey,
      shift = event.shiftKey,
      selection = promptUtils.getSelectionLength(event) !== 0,
      targetCommand = {key, alt, meta, ctrl, shift, selection},
      matches = _.matches(targetCommand),
      feature = _.find(features, feature => _.some(feature.keyboardShortcuts, matches));

    if (feature && _.isFunction(props[feature.onClick])) {
      if (feature.whenBusy === true && !props.busy) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      props[feature.onClick](event);
    }
  },
  handleAnnotationLoad() {
    const stickyBottomScroll = this.refs.stickyBottomScroll;

    if (stickyBottomScroll) {
      stickyBottomScroll.update();
    }
  },
  render() {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);
    let contents, suggestionClassName, suggestionLabel, terminalContent;

    if (props.terminalError) {
      terminalContent = (
        <TerminalError
          onInstallPythonPackage={props.onInstallPythonPackage}
          {...props.terminalError}
        />
      );
    } else {
      if (props.items && props.items.length) {
        contents = (
          <DocumentTerminalHistory
            items={props.items}
            onAnnotationBlur={props.onAnnotationBlur}
            onAnnotationClick={props.onAnnotationClick}
            onAnnotationCopy={props.onAnnotationCopy}
            onAnnotationDrag={props.onAnnotationDrag}
            onAnnotationFocus={props.onAnnotationFocus}
            onAnnotationGoTo={props.onAnnotationGoTo}
            onAnnotationLoad={this.handleAnnotationLoad}
            onAnnotationSave={props.onAnnotationSave}
            onInstallPythonPackage={props.onInstallPythonPackage}
          />
        );
      } else {
        suggestionClassName = 'empty-suggestion--visible';
        suggestionLabel = [];

        if (props.cwd) {
          suggestionLabel.push(text.workingDirectoryLabel + ': ' + props.cwd);
        }

        suggestionLabel.push(text.suggestionExample);
        suggestionLabel = suggestionLabel.join('\n\n');
      }

      terminalContent = (
        <StickyBottomScroll ref="stickyBottomScroll" {...props}>
          {contents}
          <PromptViewer
            continueLabel={props.continueLabel}
            cursor={props.cursor}
            cursorType={props.cursorType}
            inputPrompt={props.inputPrompt}
            lines={props.lines}
            onAutocomplete={props.onPromptAutocomplete}
            onCommand={props.onPromptCommand}
            onExecute={props.onPromptExecute}
            onInput={props.onPromptInput}
            promptLabel={props.promptLabel}
            showPrompt={!props.busy}
            tabIndex={props.tabIndex}
          />
        </StickyBottomScroll>
      );
    }

    return (
      <div className={className.join(' ')} onClick={this.handleClick} onKeyDown={this.handleKeyDown}>
        <DocumentTerminal {...props}>
          <EmptySuggestion className={suggestionClassName} label={suggestionLabel}/>
          {terminalContent}
        </DocumentTerminal>
        <GrayInfo cwd={props.cwd}>
          <GrayInfoLinkList>
            {features.map((feature, featureIndex) => {
              if (_.isFunction(props[feature.onClick])) {
                return <GrayInfoLink{...feature} key={featureIndex} onClick={props[feature.onClick]}/>;
              }
            })}
          </GrayInfoLinkList>
          <GrayInfoLink
            label={props.cwd}
            onClick={props.onShowSelectWorkingDirectoryDialog}
          />
        </GrayInfo>
      </div>
    );
  }
}));
