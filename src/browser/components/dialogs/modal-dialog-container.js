import _ from 'lodash';
import React from 'react';
import ModalDialog from './modal-dialog';
import AboutRodeo from './about-rodeo.js';
import AskQuit from '../../containers/ask-quit-dialog-viewer/ask-quit-dialog-viewer.jsx';
import StickersPane from './stickers-pane.js';
import Acknowledgements from './acknowledgements.js';
import EnvironmentVariablesDialogViewer from '../../containers/environment-variables-dialog-viewer/environment-variables-dialog-viewer';
import PreferencesViewer from '../../containers/preferences-viewer/preferences-viewer';
import ManageConnectionsViewer from '../../containers/manage-connections-viewer/manage-connections-viewer';
import RegisterRodeo from '../register-rodeo/register-rodeo.jsx';
import commonReact from '../../services/common-react';
import './modal-dialog-container.css';

function getModalClassName(modal) {
  if (modal.modalSize === 'full') {
    return 'modal-dialog-instance--full';
  } else if (modal.modalSize === 'small') {
    return 'modal-dialog-instance--small';
  }
}

export default React.createClass({
  displayName: 'ModalDialogContainer',
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onCancelAll: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired,
    onRegister: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
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
      classNameContainer = commonReact.getClassNameList(this),
      handleBackgroundClick = this.handleBackgroundClick,
      types = {
        aboutRodeo: modal => (
          <AboutRodeo
            {...modal.content}
            onOK={_.partial(props.onOK, modal.id)}
          />
        ),
        aboutStickers: modal => (
          <StickersPane
            {...modal.content}
            onCancel={_.partial(props.onCancel, modal.id)}
          />
        ),
        acknowledgements: modal => (
          <Acknowledgements
            {...modal.content}
            onOK={_.partial(props.onOK, modal.id)}
          />
        ),
        askQuit: modal => (
          <AskQuit
            {...modal.content}
            onCancel={_.partial(props.onCancel, modal.id)}
          />
        ),
        environmentVariables: modal => (
          <EnvironmentVariablesDialogViewer
            {...modal.content}
            onOK={_.partial(props.onOK, modal.id)}
          />
        ),
        manageConnections: modal => (
          <ManageConnectionsViewer
            {...modal.content}
            onOK={_.partial(props.onOK, modal.id)}
          />
        ),
        preferences: modal => (
          <PreferencesViewer
            {...modal.content}
            onOK={_.partial(props.onOK, modal.id)}
          />
        ),
        registerRodeo: modal => (
          <RegisterRodeo
            {...modal.content}
            onOK={_.partial(props.onOK, modal.id)}
          />
        ),
        connections: modal => (
          <ManageConnectionsViewer
            {...modal.content}
            onOK={_.partial(props.onOK, modal.id)}
          />
        )
      };

    if (props.items.length) {
      classNameContainer.push('modal-dialog-container--active');
    }

    return (
      <div className={classNameContainer.join(' ')}>
        {_.map(props.items, modal => (
          <div className="inner-container" onClick={handleBackgroundClick}>
            <ModalDialog
              className={getModalClassName(modal)}
              key={modal.id}
              {...modal}
            >{types[modal.contentType](modal)}</ModalDialog>
          </div>
        ))}
      </div>
    );
  }
});
