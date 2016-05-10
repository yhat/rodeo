import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import ModalDialog from './modal-dialog.jsx';
import Marked from '../marked/marked.jsx';
import AboutRodeo from '../about-rodeo/about-rodeo.jsx';
import StickersPane from '../stickers-pane/stickers-pane.jsx';
import Acknowledgements from '../acknowledgements/acknowledgements.jsx';
import Preferences from '../preferences/preferences.jsx';
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
  /**
   * @param {MouseEvent} event
   */
  handleBackgroundClick: function (event) {
    console.log('handleBackgroundClick', event.currentTarget, event.target, event.currentTarget === event.target);
    if (event.currentTarget === event.target) {
      this.props.onCancelAll();
      event.preventDefault();
    }
  },
  render: function () {
    let props = this.props,
      handleBackgroundClick = this.handleBackgroundClick,
      classNameContainer = [
        'modal-dialog-container',
        props.modalDialogs.length ? 'active' : ''
      ].join(' '),
      classNameBackground = [
        'modal-dialog-background'
      ].join(' '),
      background,
      last;

    function getModal(modal) {
      let contents,
        onCancel = _.partial(props.onCancel, modal.id),
        onOK = _.partial(props.onOK, modal.id);

      if (modal.contentType === 'MARKED') {
        contents = (
          <ModalDialog id={modal.id} key={modal.id} onCancel={onCancel} onOK={onOK} title={modal.title}>
            <Marked {...modal.options}>{modal.content}</Marked>
          </ModalDialog>
        );
      } else if (modal.contentType === 'ABOUT_RODEO') {
        contents = (
          <ModalDialog id={modal.id} key={modal.id} onCancel={onCancel} onOK={onOK} title={modal.title}>
            <AboutRodeo />
          </ModalDialog>
        );
      } else if (modal.contentType === 'ABOUT_STICKERS') {
        contents = (
          <ModalDialog id={modal.id} key={modal.id} onCancel={onCancel} onOK={onOK}>
            <StickersPane onOK={onOK} />
          </ModalDialog>
        );
      } else if (modal.contentType === 'ACKNOWLEDGEMENTS') {
        contents = (
          <ModalDialog id={modal.id} key={modal.id} onCancel={onCancel} onOK={onOK}>
            <Acknowledgements />
          </ModalDialog>
        );
      } else if (modal.contentType === 'PREFERENCES') {
        contents = (
          <ModalDialog id={modal.id} key={modal.id} onCancel={onCancel} onOK={onOK}>
            <Preferences />
          </ModalDialog>
        );
      } else {
        throw new Error('Unknown dialog type ' + modal.contentType);
      }

      return <div className="inner-container" onClick={handleBackgroundClick}>{contents}</div>;
    }

    if (props.modalDialogs.length) {
      last = getModal(_.last(props.modalDialogs));
    }

    return (
      <div className={classNameContainer}>
        {_.map(_.dropRight(props.modalDialogs, 1), getModal)}
        {background}
        {last}
      </div>
    );
  }
}));
