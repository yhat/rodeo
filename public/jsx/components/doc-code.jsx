/* globals React */
'use strict';

const DocCode = window.DocCode = React.createClass({
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

DocCode.propTypes = {
  text: React.PropTypes.string.isRequired
};