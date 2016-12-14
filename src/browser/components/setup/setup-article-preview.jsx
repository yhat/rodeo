import _ from 'lodash';
import React from 'react';
import Marked from '../marked';
import './setup-article-preview.css';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'SetupArticlePreview',
  propTypes: {
    articles: React.PropTypes.array.isRequired,
    onOpenExternal: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <div className="setup-inner">
        {_.map(props.articles, (article, index) => {
          const style = {
            backgroundImage: `url(${article.imageSrc})`
          };

          return (
            <a className="setup-article" key={index} onClick={() => props.onOpenExternal(article.href)}>
              <span className="setup-article-image" style={style} />
              <div className="description"><Marked>{article.description}</Marked></div>
            </a>
          );
        })}
        </div>
      </div>
    );
  }
});
