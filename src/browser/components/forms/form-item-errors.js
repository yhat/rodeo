import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';

/**
 * @param {Error} error
 * @param {string} code
 * @returns {boolean}
 */
function isErrorCode(error, code) {
  return error.code === code || _.includes(error.message, code);
}

export default React.createClass({
  displayName: 'FormItemErrors',
  propTypes: {
    errors: React.PropTypes.array.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      content = [];

    _.each(props.errors, error => {
      let message, icon, validationInnerClass = ['fa'];

      if (isErrorCode(error, 'ENOENT')) {
        // bell // exclamation // flask
        icon = 'fa-asterisk';
        message = text['EACCES'];
      } else if (isErrorCode(error, 'EACCES')) {
        icon = 'fa-asterisk';
        message = text['EACCES'];
      } else {
        icon = 'fa-asterisk';
        message = error.message;
      }

      validationInnerClass.push(icon);
      content.push(
        <span className={validationInnerClass.join(' ')} key={[icon, message].join('/')}>
          <span className="validation-error-message">{message}</span>
        </span>
      );
    });

    return <div className="validation-errors">{content}</div>;
  }
});
