import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import Annotation from '../../components/document-terminal/document-terminal-annotation';
import Autocomplete from '../../components/document-terminal/document-terminal-autocomplete';
import PageBreak from '../../components/document-terminal/document-terminal-page-break';
import PythonError from '../../components/document-terminal/document-terminal-python-error';
import Text from '../../components/document-terminal/document-terminal-text';

export default React.createClass({
  displayName: 'DocumentTerminalHistory',
  propTypes: {
    onAnnotationBlur: React.PropTypes.func,
    onAnnotationClick: React.PropTypes.func.isRequired,
    onAnnotationCopy: React.PropTypes.func,
    onAnnotationDrag: React.PropTypes.func,
    onAnnotationFocus: React.PropTypes.func,
    onAnnotationGoTo: React.PropTypes.func,
    onAnnotationLoad: React.PropTypes.func.isRequired,
    onAnnotationSave: React.PropTypes.func,
    onInstallPythonPackage: React.PropTypes.func
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      types = {
        annotation: item => (
          <Annotation
            key={item.id}
            {...item}
            onBlur={props.onAnnotationBlur}
            onClick={_.partial(props.onAnnotationClick, item)}
            onCopy={props.onAnnotationCopy}
            onDrag={props.onAnnotationDrag}
            onFocus={props.onAnnotationFocus}
            onGoTo={props.onAnnotationGoTo}
            onLoad={props.onAnnotationLoad}
            onSave={props.onAnnotationSave}
            tabIndex="0"
          />
        ),
        autocomplete: item => (
          <Autocomplete
            key={item.id}
            {...item}
          />
        ),
        pageBreak: item => <PageBreak key={item.id}/>,
        pythonError: item => (
          <PythonError
            key={item.id}
            onInstallPythonPackage={props.onInstallPythonPackage}
            {...item}
          />
        ),
        text: item => (
          <Text
            key={item.id}
            {...item}
          />
        )
      };

    return (
      <div className={className.join(' ')}>
        {props.items.map(item => types[item.type](item))}
      </div>
    );
  }
});
