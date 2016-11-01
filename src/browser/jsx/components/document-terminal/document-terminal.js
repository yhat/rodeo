import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../services/common-react';
import './history.css';
import Line from './line';
import PythonError from './python-error';
import Annotation from './annotation';
import Autocomplete from './autocomplete';
import Prompt from '../prompt/prompt';
import EmptySuggestion from '../empty/empty-suggestion';

export default React.createClass({
  displayName: 'BlockHistory',
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onAnnotationBlur: React.PropTypes.func.isRequired,
    onAnnotationCopy: React.PropTypes.func.isRequired,
    onAnnotationDrag: React.PropTypes.func.isRequired,
    onAnnotationFocus: React.PropTypes.func.isRequired,
    onClick: React.PropTypes.func.isRequired,
    onCommand: React.PropTypes.func.isRequired,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onPaste: React.PropTypes.func.isRequired,
    onPromptAutoComplete: React.PropTypes.func.isRequired,
    onPromptBlur: React.PropTypes.func.isRequired,
    onPromptClick: React.PropTypes.func.isRequired,
    onPromptCopy: React.PropTypes.func.isRequired,
    onPromptCut: React.PropTypes.func.isRequired,
    onPromptFocus: React.PropTypes.func.isRequired,
    onPromptKeyDown: React.PropTypes.func,
    onPromptKeyPress: React.PropTypes.func.isRequired,
    onPromptKeyUp: React.PropTypes.func
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')} onClick={props.onClick}>
        <History {...props} />
        <Prompt
          {...props}
          onAutocomplete={props.onPromptAutoComplete}
          onFocus={props.onPromptFocus}
        />
      </div>
    );
  }
});
/**
 * Created by danestuckel on 10/11/16.
 */
