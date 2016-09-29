import _ from 'lodash';
import React from 'react';
import ModalDialog from './modal-dialog.jsx';
import Marked from '../marked/marked.jsx';
import AboutRodeo from '../about-rodeo/about-rodeo.jsx';
import StickersPane from '../stickers-pane/stickers-pane.jsx';
import Acknowledgements from '../acknowledgements/acknowledgements.jsx';
import PreferencesViewer from '../../containers/preferences-viewer/preferences-viewer.jsx';
import ManageConnectionsViewer from '../../containers/manage-connections-viewer/manage-connections-viewer';
import RegisterRodeo from '../register-rodeo/register-rodeo.jsx';
import ManageConnections from '../manage-connections/manage-connections';
import './modal-dialog-container.css';

/**
 * @class ModalDialogContainer
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'ModalDialogContainer',
  propTypes: {
    modalDialogs: React.PropTypes.array.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onCancelAll: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired,
    onRegister: React.PropTypes.func.isRequired
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
    const props = this.props,
      handleBackgroundClick = this.handleBackgroundClick,
      classNameContainer = [
        'modal-dialog-container',
        props.modalDialogs.length ? 'active' : ''
      ];
    let last;

    function getModal(modal) {
      let content,
        types = {
          MARKED: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <Marked {...modal.options}>{modal.content}</Marked>
            </ModalDialog>
          ),
          ABOUT_RODEO: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <AboutRodeo {...modal}/>
            </ModalDialog>
          ),
          ABOUT_STICKERS: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <StickersPane {...modal} />
            </ModalDialog>
          ),
          ACKNOWLEDGEMENTS: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <Acknowledgements {...modal} />
            </ModalDialog>
          ),
          PREFERENCES: modal => (
            <ModalDialog className="modal-dialog-instance-full" key={modal.id} {...modal}>
              <PreferencesViewer {...modal} />
            </ModalDialog>
          ),
          REGISTER_RODEO: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <RegisterRodeo {...modal} />
            </ModalDialog>
          ),
          MANAGE_CONNECTIONS: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <ManageConnectionsViewer {...modal} />
            </ModalDialog>
          )
        };

      modal = _.clone(modal);
      modal.onCancel = _.partial(props.onCancel, modal.id);
      modal.onOK = _.partial(props.onOK, modal.id);

      if (types[modal.contentType]) {
        content = types[modal.contentType](modal);
      } else {
        throw new Error('Unknown dialog type ' + modal.contentType);
      }

      return <div className="inner-container" onClick={handleBackgroundClick}>{content}</div>;
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
});
