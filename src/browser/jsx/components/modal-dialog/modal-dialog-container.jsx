import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import ModalDialog from './modal-dialog.jsx';
import Marked from '../marked/marked.jsx';
import AboutRodeo from '../about-rodeo/about-rodeo.jsx';
import StickersPane from '../stickers-pane/stickers-pane.jsx';
import Acknowledgements from '../acknowledgements/acknowledgements.jsx';
import PreferencesViewer from '../../containers/preferences-viewer/preferences-viewer.jsx';
import RegisterRodeo from '../register-rodeo/register-rodeo.jsx';
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
    onOK: (id, result) => dispatch(actions.ok(id, result)),
    onRegister: () => dispatch(actions.register())
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
    onOK: React.PropTypes.func.isRequired,
    onRegister: React.PropTypes.func,
    onRegisterError: React.PropTypes.func
  },
  /**
   * @param {MouseEvent} event
   */
  handleBackgroundClick: function (event) {
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
      ],
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
            <AboutRodeo appVersion={modal.appVersion} />
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
          <ModalDialog key={modal.id} onCancel={onCancel} onOK={onOK} {...modal}>
            <Acknowledgements />
          </ModalDialog>
        );
      } else if (modal.contentType === 'PREFERENCES') {
        contents = (
          <ModalDialog className="modal-dialog-instance-full" key={modal.id} onCancel={onCancel} onOK={onOK} {...modal}>
            <PreferencesViewer onClose={onCancel} />
          </ModalDialog>
        );
      } else if (modal.contentType === 'REGISTER_RODEO') {
        contents = (
          <ModalDialog key={modal.id} onCancel={onCancel} onOK={onOK} {...modal}>
            <RegisterRodeo onClose={onCancel} />
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
      <div className={classNameContainer.join(' ')}>
        {_.map(_.dropRight(props.modalDialogs, 1), getModal)}
        {last}
      </div>
    );
  }
}));
