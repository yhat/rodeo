import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import InfoNotification from './info-notification.jsx';
import UpdateAvailableNotification from './update-available-notification.jsx';
import Marked from '../marked';
import actions from './notifications.actions';
import './notifications-container.css';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  return _.pick(state, ['notifications']);
}

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onCancel: notification => dispatch(actions.close(notification)),
    onCancelAll: () => dispatch(actions.closeAll()),
    onOK: notification => dispatch(actions.close(notification))
  };
}

/**
 * @class NotificationsContainer
 * @extends ReactComponent
 * @property props
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'NotificationsContainer',
  propTypes: {
    onCancel: React.PropTypes.func.isRequired,
    onCancelAll: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired
  },
  render: function () {
    let props = this.props,
      classNameContainer = [
        'notifications-container',
        props.notifications.length ? 'active' : ''
      ].join(' ');

    function getItem(item) {
      let onOK = _.partial(props.onOK, item),
        onCancel = _.partial(props.onCancel, item);

      if (item.type === 'AUTO_UPDATE_DOWNLOADED') {
        return (
          <UpdateAvailableNotification id={item.id} key={item.id} onCancel={onCancel} onOK={onOK} />
        );
      } else {
        return (
          <InfoNotification id={item.id} key={item.id} onOK={onOK}>
            <Marked {...item.options}>{item.content}</Marked>
          </InfoNotification>
        );
      }
    }

    return (
      <div className={classNameContainer}>
        {_.map(props.notifications, getItem)}
      </div>
    );
  }
}));
