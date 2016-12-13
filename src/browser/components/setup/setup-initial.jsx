import React from 'react';
import Marked from '../marked';
import SetupArticlePreview from './setup-article-preview.jsx';
import SetupSkipStartup from './setup-skip-startup';
import logo from './logo-rodeo-grey-text.svg';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupInitial',
  propTypes: {
    articles: React.PropTypes.array.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onOpenExternal: React.PropTypes.func.isRequired,
    onSkipStartup: React.PropTypes.func.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  componentDidMount: function () {
    this.props.onExecute();
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this),
      progressBarStyle = {
        width: '100%'
      };

    return (
      <div className={className.join(' ')}>
        <div className="setup-inner">
          <div className="brand"><img src={logo} /></div>
          <div className="progress">
            <div className="progress-bar progress-bar-striped active" style={progressBarStyle}>
              <Marked>{text.loading}</Marked>
            </div>
          </div>
          <SetupArticlePreview articles={props.articles} onOpenExternal={props.onOpenExternal}/>
          <SetupSkipStartup {...props}/>
        </div>
      </div>
    );
  }
});
