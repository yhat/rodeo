import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './document-terminal-annotation.css';
import UnsafeHtml from '../unsafe-html.js';

function getId(props, mimeType) {
  return props.id + '-' + _.kebabCase(mimeType);
}

export default React.createClass({
  displayName: 'DocumentTerminalAnnotation',
  propTypes: {
    data: React.PropTypes.object.isRequired,
    id: React.PropTypes.string.isRequired,
    onBlur: React.PropTypes.func.isRequired,
    onClick: React.PropTypes.func.isRequired,
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
        const id = getId(props, mimeType);

        images.push(
          <img
            className="document-terminal-annotation__image"
            id={id}
            key={id}
            onLoad={props.onLoad}
            src={data[mimeType]}
          />
        );
        delete data[mimeType];
      }
    }

    function addHTMLType(mimeType) {
      if (data[mimeType]) {
        const id = getId(props, mimeType);

        html.push(
          <UnsafeHtml
            className="document-terminal-annotation__html"
            id={id}
            key={id}
            onLoad={props.onLoad}
            src={data[mimeType]}
          />);
        delete data[mimeType];
      }
    }

    function addTextType(mimeType) {
      if (data[mimeType]) {
        const id = getId(props, mimeType);

        text.push(
          <div
            className="document-terminal-annotation__text"
            id={id}
            key={id}
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
        onClick={props.onClick}
        onCopy={props.onCopy}
        onDrag={props.onDrag}
        onFocus={props.onFocus}
      >
        {images}{html}{text}
      </div>
    );
  }
});
