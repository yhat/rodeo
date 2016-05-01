import React from 'react';

export default React.createClass({
  displayName: 'HelpViewer',
  render: function () {
    return (
      <div>
        <pre id="help-content"><i>{'run help(...) for more info'}</i></pre>
      </div>
    );
  }
});