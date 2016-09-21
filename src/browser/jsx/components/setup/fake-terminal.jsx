import React from 'react';
import './fake-terminal.css';
import commonReact from '../../services/common-react';

/**
 * @class FakeTerminal
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FakeTerminal',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      content = [];

    if (props.state) {
      className.push(props.state);
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
