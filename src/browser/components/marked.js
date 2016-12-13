import React from 'react';
import commonReact from '../services/common-react';
import marked from 'marked';

const htmlLinkRegex = /<a href=["']([a-z0-9\.\\\/\:]+)["']\s*(?: title=["'](.*)["'])?>(.*)<\/a>/;

/**
 * @see https://facebook.github.io/react/docs/tutorial.html#adding-markdown
 */
export default React.createClass({
  displayName: 'Marked',
  shouldComponentUpdate() {
    // always redraw, because we're using children
    // todo: change to use property instead
    return true;
  },
  getRawMarkup() {
    const renderer = new marked.Renderer(),
      props = this.props,
      str = props.children && props.children.toString();

    function templateLink(href, title, text) {
      return `<a onclick="require('electron').shell.openExternal('${href}');" title="${title}">${text}</a>`;
    }

    renderer.link = templateLink;
    renderer.html = function (html) {
      const match = html.match(htmlLinkRegex);

      return match ? templateLink(match[1], match[2], match[3]) : html;
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
    const className = commonReact.getClassNameList(this);

    return (
      /* eslint react/no-danger: 0 */
      <span className={className.join(' ')} dangerouslySetInnerHTML={this.getRawMarkup()}/>
    );
  }
});
