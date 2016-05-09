import React from 'react';
import './modal-dialog.css';

/**
 * @class ModalDialog
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'ModalDialog',
  propTypes: {
    buttons: React.PropTypes.array,
    id: React.PropTypes.string.isRequired,
    onApply: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    onOK: React.PropTypes.func,
    title: React.PropTypes.string
  },
  render: function () {
    const props = this.props;
    let footer, header;

    if (props.title) {
      header = <header>{props.title}</header>;
    }

    if (props.buttons) {
      let okButton, applyButton, cancelButton;

      if (props.onOK) {
        okButton = <button className="btn btn-default" onClick={props.onOK}>{'OK'}</button>;
      }

      if (props.onApply) {
        applyButton = <button className="btn btn-default" onClick={props.onApply}>{'Apply'}</button>;
      }

      if (props.onCancel) {
        cancelButton = <button className="btn btn-default" onClick={props.onCancel}>{'Cancel'}</button>;
      }

      footer = <footer>{cancelButton}{applyButton}{okButton}</footer>;
    }

    return (
      <div>
        <section className="modal-dialog">
          {header}
          {props.children}
          {footer}
        </section>
      </div>
    );
  }
});
