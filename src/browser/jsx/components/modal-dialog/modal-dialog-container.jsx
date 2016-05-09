import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import ModalDialog from './modal-dialog.jsx';
import Marked from '../marked/marked.jsx';
import StickersPane from '../stickers-pane/stickers-pane.jsx';
import actions from './modal-dialog.actions';
import './modal-dialog-container.css';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  return _.pick(state, ['modalDialogs']);
}

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onCancel: id => dispatch(actions.cancel(id)),
    onCancelAll: () => dispatch(actions.cancelAll()),
    onOK: (id, result) => dispatch(actions.ok(id, result))
  };
}

/**
 * @class ModalDialogContainer
 * @extends ReactComponent
 * @property props
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'ModalDialogContainer',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onCancelAll: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired
  },
  render: function () {
    let props = this.props,
      classNameContainer = [
        'modal-dialog-container',
        props.modalDialogs.length ? 'active' : ''
      ].join(' '),
      classNameBackground = [
        'modal-dialog-background'
      ].join(' ');

    return (
      <div className={classNameContainer}>
        <div className={classNameBackground} onClick={props.onCancelAll}></div>
        {props.modalDialogs.map((modal) => {
          let contents,
            onCancel = _.partial(this.props.onCancel, modal.id),
            onOK = _.partial(this.props.onOK, modal.id);

          if (modal.contentType === 'MARKED') {
            contents = (
              <ModalDialog id={modal.id} onCancel={onCancel} onOK={onOK} title={modal.title}>
                <Marked {...modal.options}>{modal.content}</Marked>
              </ModalDialog>
            );
          } else if (modal.contentType === 'STICKERS') {
            contents = (
              <ModalDialog id={modal.id} onCancel={onCancel} onOK={onOK}>
                <StickersPane onOK={onOK} />
              </ModalDialog>
            );
          } else {
            throw new Error('Unknown dialog type ' + modal.contentType);
          }

          return contents;
        })}
      </div>
    );
  }
}));
