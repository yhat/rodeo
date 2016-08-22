import _ from 'lodash';
import React from 'react';
import './fake-terminal.css';

/**
 * @class FakeTerminal
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FakeTerminal',
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName), props.state],
      content = [];

    if (props.className) {
      className.push(props.className);
    }

    content.push(
      <div>
        <span className="prompt">{props.prompt}</span>
        <span className="command">{props.cmd}</span>
      </div>
    );

    if (props.state === 'executing') {
      content.push(<span className="fa fa-cog fa-spin fa-2x"/>);
    }

    content.push(<div className="stderr">{props.stderr}</div>);
    content.push(<div className="stdout">{props.stdout}</div>);

    if (!props.errors.length && !!props.code) {
      const str = ['Exit Code:', props.code].join(' ');

      content.push(<div className="exit-code">{str}</div>);
    }

    if (props.errors.length) {
      content.push(<div className="errors">
        {props.errors.map(error => {
          const iconClassName = ['fa', error.icon];

          return (
            <div>
              <span className={iconClassName.join(' ')}/>
              {error.message}
            </div>
          );
        })}</div>);
    }

    return <div className={className.join(' ')}>{content}</div>;
  }
});
