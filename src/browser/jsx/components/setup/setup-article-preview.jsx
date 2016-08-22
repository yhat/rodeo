import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import './setup-article-preview.css';

export default React.createClass({
  displayName: 'SetupArticlePreview',
  propTypes: {
    articles: React.PropTypes.array.isRequired,
    onOpenExternal: React.PropTypes.func.isRequired
  },
  render: function () {
    const props = this.props;

    return (
      <div className="setup-article-preview">
      {_.map(props.articles, article => {
        const style = {
          backgroundImage: `url(${article.imageSrc})`
        };

        return (
          <a className="setup-article" onClick={() => props.onOpenExternal(article.href)}>
            <span className="setup-article-image" style={style} />
            <div className="description"><Marked>{article.description}</Marked></div>
          </a>
        );
      })}
      </div>
    );
  }
});
