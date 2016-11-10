import React from 'react';
import {send} from 'ipc';
import commonReact from '../services/common-react';

export default React.createClass({
  displayName: 'Yhat',
  shouldComponentUpdate(nextProps, nextState) {
    return commonReact.shouldComponentUpdate(this, nextProps, nextState);
  },
  handleYhat: () => send('openExternal', 'http://yhat.com/').catch(error => console.error(error)),
  render: function () {
    return (
      <a onClick={this.handleYhat}>
        <span style="color: #ee5311;">{'&ycirc;'}</span>
        <span style="color: #898989">{'hat'}</span>
      </a>
    );
  }
});
