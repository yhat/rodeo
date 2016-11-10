import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import SetupArticlePreview from './setup-article-preview.jsx';
import logo from './logo-rodeo-grey-text.svg';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupInitial',
  propTypes: {
    articles: React.PropTypes.array.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onOpenExternal: React.PropTypes.func.isRequired,
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
      className = commonReact.getClassNameList(this),
      progressBarStyle = {
        width: '100%'
      };

    return (
      <div className={className.join(' ')}>
        <div>
          <div className="brand"><img src={logo} /></div>
          <div className="progress">
            <div className="progress-bar progress-bar-striped active" style={progressBarStyle}>
              <Marked>{props.text.loading}</Marked>
            </div>
          </div>
          <SetupArticlePreview articles={props.articles} onOpenExternal={props.onOpenExternal}/>
        </div>
      </div>
    );
  }
});
