import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import './update-available-notification.css';
import downloadCloudFlat from './download-cloud-flat.svg';
import applicationActions from '../../actions/application';

const showClass = 'notification-show';

/**
 * @class UpdateAvailableNotification
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'UpdateAvailableNotification',
  propTypes: {
    id: React.PropTypes.string.isRequired,
    onCancel: React.PropTypes.func,
    onOK: React.PropTypes.func
  },
  contextTypes: {
    store: React.PropTypes.object
  },
  componentDidMount: function () {
    const el = ReactDOM.findDOMNode(this);

    _.defer(() => el.classList.add(showClass));
  },
  handleOK: function () {
    this.context.store.dispatch(applicationActions.quitAndInstallUpdates());
    this.props.onOK();
  },
  render: function () {
    const props = this.props;

    return (
      <section className="update-available-notification">
        <div className="icon-container"><img src={downloadCloudFlat} /></div>
        <div className="info-notification-content">{'Rodeo\'s been updated!'}</div>
        <footer>
          <button className="btn btn-default" onClick={props.onCancel}>{'Later'}</button>
          <button className="btn btn-default" onClick={this.handleOK}>{'Restart Rodeo'}</button>
        </footer>
      </section>
    );
  }
});
