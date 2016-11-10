/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../../services/common-react';
import selectionUtil from '../../../services/selection-util';
import './execution-result-block.css';

export default React.createClass({
  displayName: 'ExecutionResultBlock',
  propTypes: {
    data: React.PropTypes.object,
    onSave: React.PropTypes.func
  },

  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  handleCopy(data, event) {
    event.preventDefault();

    _.each(data, (value, key) => event.clipboardData.setData(key, value));
  },

  handleDragStart(data, event) {
    event.dataTransfer.effectAllowed = 'copy';

    _.each(data, (value, key) => {
      event.dataTransfer.setData(key, value);
    });
  },

  handleCopyButton() {
    const el = ReactDOM.findDOMNode(this);

    selectionUtil.copy(el);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      data = props.data,
      size = _.size(data),
      menu = [];
    let content;

    className.push('font-monospaced');

    if (props.onSave) {
      menu.push(<span className="fa fa-save" key="save" onClick={_.partial(props.onSave, data)} title="Save"/>);
    }

    menu.push(<span className="fa fa-copy" key="copy" onClick={this.handleCopyButton} title="Copy"/>);

    if (size > 1) {
      if (data['text/html']) {
        content = <div dangerouslySetInnerHTML={{__html: data['text/html']}} />;
      } else {
        content = <span>{JSON.stringify(data)}</span>;
      }
    } else if (size === 1) {
      if (data['text/plain']) {
        content = <span>{data['text/plain']}</span>;
      } else {
        content = <span>{JSON.stringify(data)}</span>;
      }
    } else {
      content = <span>{'√'}</span>;
    }

    return (
      <section
        className={className.join(' ')}
        onCopy={_.partial(this.handleCopy, data)}
        tabIndex={props.tabIndex || 0}
      >
        <header>
          {'result'}
          <div className="input-stream-block__menu">{menu}</div>
        </header>
        <div draggable="true" onDragStart={_.partial(this.handleDragStart, data)}>{content}</div>
      </section>
    );
  }
});
