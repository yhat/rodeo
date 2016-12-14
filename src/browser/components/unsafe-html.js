import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../services/common-react';

export default React.createClass({
  displayName: 'UnsafeHTML',
  propTypes: {
    id: React.PropTypes.string.isRequired,
    onLoad: React.PropTypes.func,
    src: React.PropTypes.string.isRequired
  },
  componentDidMount: function () {
    const el = ReactDOM.findDOMNode(this);

    if (el) {
      el.setAttribute('src', this.props.src);
    }
  },
  shouldComponentUpdate(nextProps, nextState) {
    return commonReact.shouldComponentUpdate(this, nextProps, nextState);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <iframe
        className={className.join(' ')}
        frameBorder="0"
        id={props.id}
        onLoad={props.onLoad}
        sandbox="allow-scripts"
      ></iframe>
    );
  }
});
