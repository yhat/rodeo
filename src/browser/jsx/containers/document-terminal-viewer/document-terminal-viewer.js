import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import DocumentTerminal from '../../components/document-terminal/document-terminal';
import StickyBottomScroll from '../../components/document-terminal/sticky-bottom-scroll';
import PromptViewer from '../prompt-viewer/prompt-viewer';
import EmptySuggestion from '../../components/empty/empty-suggestion';
import Text from '../../components/document-terminal/document-terminal-text';
import Annotation from '../../components/document-terminal/document-terminal-annotation';
import PythonError from '../../components/document-terminal/document-terminal-python-error';
import Autocomplete from '../../components/document-terminal/document-terminal-autocomplete';
import PageBreak from '../../components/document-terminal/document-terminal-page-break';
import GrayInfo from '../../components/gray-info/gray-info';
import GrayInfoLink from '../../components/gray-info/gray-info-link';
import GrayInfoLinkList from '../../components/gray-info/gray-info-link-list';
import './document-terminal-viewer.css';
import selectionUtil from '../../services/selection-util';
import features from './features.yml';
import promptUtils from '../../services/util/prompt-util';

export default React.createClass({
  displayName: 'DocumentTerminalViewer',
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onAnnotationBlur: React.PropTypes.func,
    onAnnotationCopy: React.PropTypes.func.isRequired,
    onAnnotationDrag: React.PropTypes.func,
    onAnnotationFocus: React.PropTypes.func,
    onAnnotationGoTo: React.PropTypes.func,
    onAnnotationSave: React.PropTypes.func,
    onClear: React.PropTypes.func,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onInterrupt: React.PropTypes.func,
    onRestart: React.PropTypes.func,
    onPromptAutocomplete: React.PropTypes.func.isRequired,
    onPromptBlur: React.PropTypes.func.isRequired,
    onPromptExecute: React.PropTypes.func.isRequired,
    onPromptFocus: React.PropTypes.func.isRequired,
    onPromptCommand: React.PropTypes.func.isRequired,
    onShowSelectWorkingDirectoryDialog: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleClick: function (event) {
    event.preventDefault();
    event.stopPropagation();
    const el = event.currentTarget.querySelector('.prompt'),
      isSelectionClick = selectionUtil.isSelectionClick(window.getSelection());

    if (el && isSelectionClick) {
      el.focus();
      window.getSelection().collapse(el, 0);
    }
  },
  handleKeyDown: function (event) {
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
      event.preventDefault();
      event.stopPropagation();
      props[feature.onClick](event);
    }
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      types = {
        annotation: item => (
          <Annotation
            key={item.id}
            {...props}
            {...item}
            onBlur={props.onAnnotationBlur}
            onCopy={props.onAnnotationCopy}
            onDrag={props.onAnnotationDrag}
            onFocus={props.onAnnotationFocus}
            onGoTo={props.onAnnotationGoTo}
            onSave={props.onAnnotationSave}
            tabIndex="0"
          />
        ),
        autocomplete: item => (
          <Autocomplete
            key={item.id}
            {...props}
            {...item}
          />
        ),
        pageBreak: item => <PageBreak key={item.id}/>,
        pythonError: item => (
          <PythonError
            key={item.id}
            {...props}
            {...item}
          />
        ),
        text: item => (
          <Text
            key={item.id}
            {...props}
            {...item}
          />
        )
      };
    let contents, suggestionClassName, suggestionLabel;

    if (props.items && props.items.length) {
      contents = props.items.map(item => types[item.type](item));
    } else {
      suggestionClassName = 'empty-suggestion--visible';
      suggestionLabel = [];

      if (props.cwd) {
        suggestionLabel.push('Working Directory: ' + props.cwd);
      }

      suggestionLabel.push('\nExample:\n    print("Welcome to Rodeo!")');
      suggestionLabel = suggestionLabel.join('\n');
    }

    return (
      <div className={className.join(' ')} onClick={this.handleClick} onKeyDown={this.handleKeyDown}>
        <DocumentTerminal {...props}>
          <StickyBottomScroll {...props}>
            {contents}
            <PromptViewer
              onAutocomplete={props.onPromptAutocomplete}
              onCommand={props.onPromptCommand}
              onExecute={props.onPromptExecute}
              {...props}
            />
            <EmptySuggestion className={suggestionClassName} key="empty" label={suggestionLabel}/>
          </StickyBottomScroll>
        </DocumentTerminal>
        <GrayInfo cwd={props.cwd}>
          <GrayInfoLinkList>
            {features.map(feature => {
              if (_.isFunction(props[feature.onClick])) {
                return <GrayInfoLink{...feature} onClick={props[feature.onClick]}/>;
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
});
