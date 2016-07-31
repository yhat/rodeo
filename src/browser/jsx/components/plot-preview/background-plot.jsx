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
    data: React.PropTypes.object.isRequired,
    hasFocus: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      hasFocus: false,
      onClick: _.noop
    };
  },
  shouldComponentUpdate(nextProps, nextState) {
    return !commonReact.shallowCompare(this, nextProps, nextState);
  },
  render: function () {
    const props = this.props,
      data = props.data;
    let itemStyle,
      className = [
        'item',
        props.hasFocus ? 'active' : ''
      ];

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

    className = className.join(' ');

    return (
      <div
        className={className}
        onClick={_.partial(props.onClick, props.id)}
        style={itemStyle}
      ></div>
    );
  }
});
