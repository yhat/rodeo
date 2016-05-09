import React from 'react';
import marked from 'marked';

/**
 * @class Marked
 * @extends ReactComponent
 * @property props
 * @see https://facebook.github.io/react/docs/tutorial.html#adding-markdown
 */
export default React.createClass({
  displayName: 'Marked',
  getRawMarkup: function () {
    return { __html: marked(this.props.children.toString(), {sanitize: false}) };
  },
  render: function () {
    return (
      /* eslint react/no-danger: 0 */
      <span className="marked" dangerouslySetInnerHTML={this.getRawMarkup()} />
    );
  }
});
