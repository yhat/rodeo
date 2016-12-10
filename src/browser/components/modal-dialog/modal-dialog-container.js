import _ from 'lodash';
import React from 'react';
import ModalDialog from './modal-dialog';
import Marked from '../marked/marked.jsx';
import AboutRodeo from '../about-rodeo/about-rodeo.jsx';
import AskQuit from '../../containers/ask-quit-dialog-viewer/ask-quit-dialog-viewer.jsx';
import StickersPane from '../stickers-pane/stickers-pane.jsx';
import Acknowledgements from '../acknowledgements/acknowledgements.jsx';
import PreferencesViewer from '../../containers/preferences-viewer/preferences-viewer.js';
import ManageConnectionsViewer from '../../containers/manage-connections-viewer/manage-connections-viewer';
import RegisterRodeo from '../register-rodeo/register-rodeo.jsx';
import commonReact from '../../services/common-react';
import './modal-dialog-container.css';

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
      handleBackgroundClick = this.handleBackgroundClick;
    let last;

    if (props.items.length) {
      classNameContainer.push('modal-dialog-container--active');
    }

    function getModal(modal) {
      let content,
        types = {
          marked: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <Marked {...modal.options}>{modal.content}</Marked>
            </ModalDialog>
          ),
          aboutRodeo: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <AboutRodeo {...modal.content}/>
            </ModalDialog>
          ),
          aboutStickers: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <StickersPane {...modal.content} />
            </ModalDialog>
          ),
          acknowledgement: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <Acknowledgements {...modal.content} />
            </ModalDialog>
          ),
          askQuit: modal => (
            <ModalDialog className="modal-dialog-instance--small" key={modal.id} {...modal}>
              <AskQuit {...modal.content} />
            </ModalDialog>
          ),
          preferences: modal => (
            <ModalDialog className="modal-dialog-instance--full" key={modal.id} {...modal}>
              <PreferencesViewer
                {...modal.content}
                onOK={_.partial(props.onOK, modal.id)}
              />
            </ModalDialog>
          ),
          registerRodeo: modal => (
            <ModalDialog className="modal-dialog-instance--full" key={modal.id} {...modal}>
              <RegisterRodeo {...modal.content} />
            </ModalDialog>
          ),
          connections: modal => (
            <ModalDialog key={modal.id} {...modal}>
              <ManageConnectionsViewer {...modal.content} />
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

    if (props.items.length) {
      last = getModal(_.last(props.items));
    }

    return (
      <div className={classNameContainer.join(' ')}>
        {_.map(_.dropRight(props.items, 1), getModal)}
        {last}
      </div>
    );
  }
});
