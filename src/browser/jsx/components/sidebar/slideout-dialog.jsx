import React from 'react';
import './slideout-dialog.css';
import commonReact from '../../services/common-react';

const showClass = 'slideout-dialog-show';

/**
 * @class SlideoutDialog
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'SlideoutDialog',
  propTypes: {
    isExpanded: React.PropTypes.bool,
    url: React.PropTypes.string
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    if (props.isExpanded) {
      className.push(showClass);
    }

    return (
      <div className={className.join(' ')}>
        <iframe frameBorder="0" src={props.url}></iframe>
      </div>
    );
  }
});
