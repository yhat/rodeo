import _ from 'lodash';
import React from 'react';
import marked from 'marked';

const htmlLinkRegex = /<a href=["']([a-z0-9\.\\\/\:]+)["']\s*(?: title=["'](.*)["'])?>(.*)<\/a>/;

/**
 * @class Marked
 * @extends ReactComponent
 * @property props
 * @see https://facebook.github.io/react/docs/tutorial.html#adding-markdown
 */
export default React.createClass({
  displayName: 'Marked',
  propTypes: {
    className: React.PropTypes.string
  },
  getRawMarkup: function () {
    const renderer = new marked.Renderer(),
      str = this.props.children && this.props.children.toString();

    function templateLink(href, title, text) {
      return `<a onclick="require('electron').shell.openExternal('${href}');" title="${title}">${text}</a>`;
    }

    renderer.link = templateLink;
    renderer.html = function (html) {
      const match = html.match(htmlLinkRegex);

      if (match) {
        return templateLink(match[1], match[2], match[3]);
      } else {
        return html;
      }
    };

    let paragraphHandler = renderer.paragraph;

    renderer.paragraph = function (text) {
      text = text.replace(htmlLinkRegex,
        '<a onclick="require(\'electron\').shell.openExternal(\'$1\');" title="$2">$3</a>');
      return paragraphHandler(text);
    };

    return str && {__html: marked(str, {renderer: renderer})} || {__html: '<span />'};
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)];

    if (props.className) {
      className.push(props.className);
    }

    return (
      /* eslint react/no-danger: 0 */
      <span className={className.join(' ')} dangerouslySetInnerHTML={this.getRawMarkup()}/>
    );
  }
});
