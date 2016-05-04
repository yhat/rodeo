import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'lodash';

export default React.createClass({
  displayName: 'SplitPane',
  propTypes: {
    // not horizontal/vertical; often interpreted wrong,
    direction: React.PropTypes.oneOf(['top-bottom', 'left-right']).isRequired,
    id: React.PropTypes.string,
    limit: React.PropTypes.number,
    onDrag: React.PropTypes.func,
    onDragEnd: React.PropTypes.func,
    onDragStart: React.PropTypes.func,
    position: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number])
  },
  contextTypes: {
    store: React.PropTypes.object
  },
  getDefaultProps: function () {
    return {
      orientation: 'top-bottom',
      limit: 100,
      position: '50%'
    };
  },
  componentDidMount: function () {
    const $el = $(ReactDOM.findDOMNode(this)),
      state = this.context.store.getState(),
      id = this.props.id,
      limit = this.props.limit,
      direction = this.props.direction;
    let position = this.props.position;

    if (state.splitPanes[id]) {
      position = state.splitPanes[id];
    }

    console.log('split-pane', {state, id, position, limit, direction});

    $el.split({
      orientation: direction === 'top-bottom' ? 'horizontal' : 'vertical',
      limit: limit,
      position: position,
      onDragStart: this.props.onDragStart || _.noop,
      onDragEnd: _.over(this.props.onDragEnd || _.noop, this.handleDragEnd),
      onDrag: _.over(this.props.onDrag || $.noop, this.handleDrag)
    }).refresh();
  },
  handleDrag: function () {
    this.context.store.dispatch({type: 'SPLIT_PANE_DRAG', id: this.props.id});
  },
  handleDragEnd: function () {
    this.context.store.dispatch({type: 'SPLIT_PANE_DRAG_END', id: this.props.id});
  },
  render: function () {
    return (
      <div id={this.props.id}>{this.props.children}</div>
    );
  }
});