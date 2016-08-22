import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import './modal-dialog.css';

const showClass = 'modal-dialog-show';

/**
 * @class ModalDialog
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'ModalDialog',
  propTypes: {
    buttons: React.PropTypes.array,
    className: React.PropTypes.string,
    id: React.PropTypes.string.isRequired,
    onApply: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    onOK: React.PropTypes.func,
    title: React.PropTypes.string
  },
  componentDidMount: function () {
    const el = ReactDOM.findDOMNode(this);

    _.defer(() => el.classList.add(showClass));
  },
  render: function () {
    const props = this.props,
      className = ['modal-dialog-instance'];
    let footer, header;

    if (props.title) {
      header = <header>{props.title}</header>;
    }

    if (props.className) {
      className.push(props.className);
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
      <section className={className.join(' ')}>
        {header}
        {props.children}
        {footer}
      </section>
    );
  }
});
