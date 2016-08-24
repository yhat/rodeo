import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import SetupArticlePreview from './setup-article-preview.jsx';
import logo from './logo-rodeo-grey-text.svg';

export default React.createClass({
  displayName: 'SetupInitial',
  propTypes: {
    articles: React.PropTypes.array.isRequired,
    className: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    text: React.PropTypes.object.isRequired
  },
  componentDidMount: function () {
    this.props.onExecute();
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)],
      progressBarStyle = {
        width: '100%'
      };

    if (props.className) {
      className.push(props.className);
    }

    return (
      <div className={className.join(' ')}>
        <div className="brand"><img src={logo} /></div>
        <div className="progress">
          <div className="progress-bar progress-bar-striped active" style={progressBarStyle}>
            <Marked>{props.text.loading}</Marked>
          </div>
        </div>
        <SetupArticlePreview {...props}/>
      </div>
    );
  }
});
