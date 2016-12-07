import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import './lib/jquery.splitter.css';
import './lib/jquery.splitter-0.15.0';
import globalObserver from '../../services/global-observer';
import {local} from '../../services/store';

function getSplitState() {
  return local.get('splitPanePositions') || {
    'split-pane-center': window.innerWidth / 2 + 'px',
    'split-pane-right': window.innerHeight / 2 + 'px',
    'split-pane-left': window.innerHeight / 2 + 'px'
  };
}

function savePosition(id) {
  const el = document.querySelector('#' + id);

  if (el) {
    let position,
      splitter = $(el).split(),
      orientation = splitter.orientation,
      state = getSplitState();

    if (orientation === 'horizontal') {
      position = el.firstChild.clientHeight;
    } else if (orientation === 'vertical') {
      position = el.firstChild.clientWidth;
    }

    if (position) {
      state[id] = position + 'px';
      local.set('splitPanePositions', state);
    }
  }
}

/**
 * @class SplitPane
 * @extends ReactComponent
 * @property props
 */
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
      position: '50%',
      onDragEnd: _.noop,
      onDragStart: _.noop,
      onDrag: _.noop
    };
  },
  componentDidMount: function () {
    const el = ReactDOM.findDOMNode(this),
      $el = $(el),
      props = this.props,
      state = getSplitState(),
      id = props.id,
      limit = props.limit,
      direction = props.direction;
    let instance,
      position = props.position;

    if (state[id]) {
      position = state[id];
    }

    instance = $el.split({
      orientation: direction === 'top-bottom' ? 'horizontal' : 'vertical',
      limit: limit,
      position: position,
      onDragStart: props.onDragStart,
      onDragEnd: _.over(props.onDragEnd, this.handleDragEnd),
      onDrag: _.over(props.onDrag, this.handleDrag)
    });

    instance.refresh();

    window.addEventListener('focus', this.handleFocus);
    this.handleFocus();
  },
  componentWillUnmount: function () {
    window.removeEventListener('focus', this.handleFocus);
  },
  /**
   * Refresh the children split panes, if any.  React loads children first, so we need to tell them their height has
   * changed.
   */
  handleFocus: function () {
    const el = ReactDOM.findDOMNode(this);

    _.defer(function () {
      $(el).data('splitter').refresh();
      _.each(el.querySelectorAll('.splitter_panel'), function (childEl) {
        $(childEl).split().refresh();
      });
    });
  },
  handleDrag: function () {
    savePosition(this.id);
    globalObserver.trigger('resize');
  },
  handleDragEnd: function () {
    savePosition(this.id);
    globalObserver.trigger('resize');
  },
  render: function () {
    return <div id={this.props.id}>{this.props.children}</div>;
  }
});
