import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import CSSTransitionGroup from 'react-addons-css-transition-group';

function wrapWithPath(item) {
  return function (fn, path) {
    const args = _.slice(arguments, 2);

    path = _.clone(path);
    path.unshift(item);
    args.unshift(path);

    return fn.apply(undefined, args);
  };
}

const TreeViewItem = React.createClass({
  displayName: 'TreeViewItem',
  propTypes: {
    expanded: React.PropTypes.bool.isRequired,
    items: React.PropTypes.array,
    label: React.PropTypes.string.isRequired,
    onCaretClick: React.PropTypes.func.isRequired,
    onLabelClick: React.PropTypes.func.isRequired,
    onLabelDoubleClick: React.PropTypes.func.isRequired,
    showCaret: React.PropTypes.bool.isRequired,
    sort: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.string, React.PropTypes.array]).isRequired
  },
  getDefaultProps: function () {
    return {
      expanded: false,
      showCaret: true
    };
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);
    let label, items, caret, icon;

    if (props.icon) {
      const iconClassName = ['tree-view-item-icon', 'fa', 'fa-' + props.icon];

      icon = <span className={iconClassName.join(' ')} />;
    }

    if (props.label) {
      label = (
        <span
          className="tree-view-item-label"
          onClick={_.partial(props.onLabelClick, [])}
          onDoubleClick={_.partial(props.onLabelDoubleClick, [])}
        >
          {icon}
          {props.label}
        </span>
      );
    }

    if (props.items && props.expanded) {
      className.push('expanded');
      items = (
        <CSSTransitionGroup
          className="tree-view-item-children"
          component="div"
          transitionAppear
          transitionAppearTimeout={100}
          transitionEnterTimeout={100}
          transitionLeaveTimeout={100}
          transitionName="tree-view-item-children"
        >
          {_.map(_.sortBy(props.items, props.sort), item => {
            const onCaretClickWithPath = _.wrap(props.onCaretClick, wrapWithPath(item)),
              onLabelClick = _.wrap(props.onLabelClick, wrapWithPath(item)),
              onLabelDoubleClick = _.wrap(props.onLabelDoubleClick, wrapWithPath(item));

            return (
              <TreeViewItem
                key={item.cid}
                onCaretClick={onCaretClickWithPath}
                onLabelClick={onLabelClick}
                onLabelDoubleClick={onLabelDoubleClick}
                sort={props.sort}
                {...item}
              />
            );
          })}
        </CSSTransitionGroup>
      );
    }

    if ((props.items && props.showCaret) || (props.expandable && props.showCaret)) {
      caret = <span className="fa fa-caret-right tree-view-caret" onClick={_.partial(props.onCaretClick, [])}/>;
    } else if (props.label) {
      caret = <span className="tree-view-caret-placeholder"/>;
    }

    return (
      <div className={className.join(' ')}>
        {caret}
        {label}
        {items}
      </div>
    );
  }
});

export default TreeViewItem;
