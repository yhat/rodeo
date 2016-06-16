import React from 'react';
import {send} from 'ipc';

/**
 * @class Yhat
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'Yhat',
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
