/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import React from 'react';
import commonReact from '../../../services/common-react';
import './image-block.css';

export default React.createClass({
  displayName: 'ImageBlock',
  propTypes: {
    alt: React.PropTypes.string,
    expanded: React.PropTypes.bool,
    href: React.PropTypes.string,
    onBlur: React.PropTypes.func,
    onContract: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onExpand: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onCut: React.PropTypes.func,
    onClick: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      expanded: false
    };
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  handleClick: function (event) {
    event.preventDefault();
    const props = this.props;

    if (props.expanded) {
      if (!this.clickTimer) {
        this.clickTimer = setTimeout(() => {
          this.clickTimer = null;
          if (props.onClick) {
            props.onClick();
          }
        }, 250);
      } else {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }
    }
  },

  handleDoubleClick: function (event) {
    event.preventDefault();
    const props = this.props;

    if (props.expanded) {
      props.onContract(event);
    } else {
      props.onExpand(event);
    }
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      menu = [];
    let contents = [<img alt={props.alt} key="contents" src={props.href}/>];

    className.push('font-monospaced');

    if (props.expanded) {
      menu.push(<span className="fa fa-contract" key="contract" onClick={props.onContract}/>);
      className.push('image-block--expanded');
    } else {
      menu.push(<span className="fa fa-expand" key="expand" onClick={props.onExpand}/>);
      className.push('image-block--compressed');
    }

    return (
      <section
        className={className.join(' ')}
        onBlur={props.onBlur}
        onClick={this.handleClick}
        onCopy={props.onCopy}
        onCut={props.onCut}
        onDoubleClick={this.handleDoubleClick}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        onKeyPress={props.onKeyPress}
        onKeyUp={props.onKeyUp}
        onPaste={props.onPaste}
        tabIndex={props.tabIndex || 0}
      >
        <header>
          {'image'}
          <div className="input-block__menu">{menu}</div>
        </header>

        <div className="image-block__contents-outer">
          <div className="input-block__contents">{contents}</div>
        </div>
      </section>
    );
  }
});
