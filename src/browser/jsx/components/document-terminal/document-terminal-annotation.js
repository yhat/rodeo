import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './document-terminal-annotation.css';
import UnsafeHtml from '../unsafe-html.jsx';

function getId(props, mimeType) {
  return props.id + '-' + _.kebabCase(mimeType);
}

export default React.createClass({
  displayName: 'DocumentTerminalAnnotation',
  propTypes: {
    data: React.PropTypes.object.isRequired,
    id: React.PropTypes.string.isRequired,
    onBlur: React.PropTypes.func.isRequired,
    onCopy: React.PropTypes.func.isRequired,
    onDrag: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func.isRequired,
    onGoTo: React.PropTypes.func.isRequired,
    onLoad: React.PropTypes.func,
    onSave: React.PropTypes.func.isRequired,
    tabIndex: React.PropTypes.number
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      data = _.clone(props.data), // shallow clone
      images = [],
      html = [],
      text = [];

    function addImageType(mimeType) {
      if (data[mimeType]) {
        images.push(
          <img
            className="document-terminal-annotation__image"
            id={getId(props, mimeType)}
            onLoad={props.onLoad}
            src={data[mimeType]}
          />
        );
        delete data[mimeType];
      }
    }

    function addHTMLType(mimeType) {
      if (data[mimeType]) {
        html.push(
          <UnsafeHtml
            className="document-terminal-annotation__html"
            id={getId(props, mimeType)}
            onLoad={props.onLoad}
            src={data[mimeType]}
          />);
        delete data[mimeType];
      }
    }

    function addTextType(mimeType) {
      if (data[mimeType]) {
        text.push(
          <div
            className="document-terminal-annotation__text"
            id={getId(props, mimeType)}
          >{data[mimeType]}</div>
        );
        delete data[mimeType];
      }
    }

    /**
     * All the leftover types are new to us
     */
    function addUnknownTypes() {
      _.each(data, (value, key) => console.warn('Annotation type not understood:', key, value));
    }

    addImageType('image/png');
    addImageType('image/svg');
    addImageType('image/jpg');
    addImageType('image/jpeg');
    addImageType('image/gif');
    addHTMLType('text/html');
    addTextType('text/plain');
    addUnknownTypes();

    return (
      <div
        className={className.join(' ')}
        onBlur={props.onBlur}
        onCopy={props.onCopy}
        onDrag={props.onDrag}
        onFocus={props.onFocus}
        tabIndex={props.tabIndex || 0}
      >
        {images}{html}{text}
         <div className="document-terminal-annotation__menu"><span className="fa fa-save" /><span className="fa fa-ellipsis-h"/></div>
      </div>
    );
  }
});
