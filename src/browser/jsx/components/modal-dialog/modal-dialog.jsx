import _ from 'lodash';
import React from 'react';

/**
 * @class ModalDialog
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'ModalDialog',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired
  },
  getDefaultProps: function () {
    return {
      onCancel: _.constant(true),
      onOK: _.constant(true),
      title: ''
    };
  },
  render: function () {
    const props = this.props;

    return (
      <div>
        <div className="modal-dialog-background"></div>
        <section className="modal-dialog">
          <header>{props.title}</header>
          {props.children}
          <footer>{props.buttons}</footer>
        </section>
      </div>
    );
  }
});
