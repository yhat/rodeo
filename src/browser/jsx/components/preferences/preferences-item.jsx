import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import PreferencesInput from './preferences-input.jsx';

const preferenceDetailsItem = 'preference-group-details-item';

/**
 * @class DocCode
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesItem',
  propTypes: {
    className: React.PropTypes.string,
    defaultValue: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
    explanation: React.PropTypes.string,
    id: React.PropTypes.string,
    keyName: React.PropTypes.string,
    type: React.PropTypes.string,
    value: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number])
  },
  getDefaultProps: function () {
    return {
      onChange: _.noop,
      type: 'text',
      defaultValue: ''
    };
  },
  handleChange: _.debounce(function () {
    this.props.onChange();
  }, 150),
  render: function () {
    const props = this.props;
    let content,
      contentClass = [
        preferenceDetailsItem,
        props.className
      ].join(' ');

    if (props.type === 'marked' && props.explanation) {
      content = <Marked>{props.explanation}</Marked>;
    } else if (props.type) {
      content = <PreferencesInput onChange={props.onChange}{...props} />;
    }

    return <div className={contentClass}>{content}</div>;
  }
});
