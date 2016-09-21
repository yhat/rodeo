import _ from 'lodash';
import React from 'react';
import htmlSplash from './html-flat.svg';
import errorSplash from './document-error-flat.svg';
import commonReact from '../../services/common-react';

/**
 * @class BackgroundPlot
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'BackgroundPlot',
  propTypes: {
    active: React.PropTypes.bool.isRequired,
    data: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      data = props.data;
    let itemStyle,
      className = commonReact.getClassNameList(this);


    if (props.active) {
      className.push('active');
    }

    if (data['image/png']) {
      itemStyle = { backgroundImage: 'url(' + data['image/png'] + ')' };
    } else if (data['image/svg']) {
      itemStyle = { backgroundImage: 'url(' + data['image/svg'] + ')' };
    } else if (data['text/html']) {
      className.push('splash');
      itemStyle = { backgroundImage: 'url(' + htmlSplash + ')' };
    } else {
      className.push('splash');
      itemStyle = { backgroundImage: 'url(' + errorSplash + ')' };
    }

    return (
      <div className={className.join(' ')} onClick={props.onClick} style={itemStyle}>
        <div className="action-bar">
          <div className="actions">
            <div className="fa fa-times action" onClick={props.onRemove}></div>
            <div className="fa fa-save action" onClick={props.onSave}></div>
          </div>
        </div>
      </div>
    );
  }
});
