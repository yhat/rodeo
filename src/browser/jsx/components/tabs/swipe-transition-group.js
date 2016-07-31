import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './closeable.css';

function show(element) {
  if (!element.classList.contains('show')) {
    element.classList.add('show');
  }
}

function addClass(element, className) {
  if (!element.classList.contains('show')) {
    element.classList.add('show');
  }
}

export default React.createClass({
  displayName: 'Closeable',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    dragX: React.PropTypes.number,
    dragY: React.PropTypes.number
  },
  getInitialState: function () {
    return {};
  },
  componentWillReceiveProps: function (nextProps) {
    const oldProps = this.props,
      state = this.state;

    if (nextProps.active !== state.coming) {
      this.setState({
        going: oldProps.active,
        coming: nextProps.active
      });
    }
  },
  shouldComponentUpdate(nextProps, nextState) {
    return (this.props !== nextProps || this.state !== nextState);
  },
  componentWillUnmount: function () {

  },
  handleTransitionEnd: function () {
    console.log('handleTransitionEnd', arguments);
    const state = this.state;

    delete state.going;
    delete state.coming;

    this.replaceState(state);
  },
  render: function () {
    const props = this.props,
      state = this.state,
      style = {},
      children = React.Children.map(props.children, child => {
        const childStyle = {};

        if (child.props.id !== state.coming && child.props.id !== state.going) {
          childStyle.display = 'none';
        }

        if (_.size(childStyle)) {
          return React.cloneElement(child, {style: childStyle});
        }

        return child;
      });

    return <div onTransitionEnd={this.handleTransitionEnd} style={style}>{children}</div>;
  }
});
