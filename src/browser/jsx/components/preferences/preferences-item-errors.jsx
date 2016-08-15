import _ from 'lodash';
import React from 'react';

/**
 * @param {Error} error
 * @param {string} code
 * @returns {boolean}
 */
function isErrorCode(error, code) {
  return error.code === code || _.includes(error.message, code);
}

/**
 * @class PreferencesItemErrors
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesItemErrors',
  propTypes: {
    errors: React.PropTypes.array.isRequired
  },
  render: function () {
    const props = this.props,
      content = [];

    _.each(props.errors, error => {
      let message, icon, validationInnerClass = ['fa'];

      if (isErrorCode(error, 'ENOENT')) {
        // bell // exclamation // flask
        icon = 'fa-asterisk';
        message = 'No such file or directory';
      } else if (isErrorCode(error, 'EACCES')) {
        icon = 'fa-asterisk';
        message = 'Permission denied';
      } else {
        icon = 'fa-asterisk';
        message = error.message;
      }

      validationInnerClass.push(icon);
      content.push(<span className={validationInnerClass.join(' ')} key={[icon, message].join('/')}>
        <span className="validation-error-message">{message}</span>
      </span>);
    });

    return <div className="validation-errors">{content}</div>;
  }
});
