import React from 'react';

/**
 * @class DocCode
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'DocCode',
  propTypes: {
    text: React.PropTypes.string.isRequired
  },
  render: function () {
    return (
      <div className="col-sm-8 col-sm-offset-2 text-left">
        <pre>{this.props.text}</pre>
      </div>
    );
  }
});
