import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import './info-notification.css';
import negativeMessage from './chat-alt-flat.svg';

const showClass = 'notification-show';

/**
 * @class InfoNotification
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'InfoNotification',
  propTypes: {
    id: React.PropTypes.string.isRequired,
    onOK: React.PropTypes.func
  },
  componentDidMount: function () {
    const el = ReactDOM.findDOMNode(this);

    _.defer(() => el.classList.add(showClass));
  },
  render: function () {
    const props = this.props;

    return (
      <section className="info-notification">
        <div className="icon-container"><img src={negativeMessage} /></div>
        <div className="info-notification-content">{props.children}</div>
        <button className="btn btn-default" onClick={props.onOK}>{'OK'}</button>
      </section>
    );
  }
});
