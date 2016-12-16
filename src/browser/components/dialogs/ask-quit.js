import React from 'react';
import commonReact from '../../services/common-react';
import './ask-quit.css';

export default React.createClass({
  displayName: 'AskQuit',
  propTypes: {
    onAskQuitChange: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onQuit: React.PropTypes.func.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render() {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);

    let content;

    if (props.state === 'quiting' || props.state === 'quit') {
      content = (
        <div className={className.join(' ')}>
          <div className="ask-quit__question">
            {text.quiting}
          </div>
        </div>
      );
    } else {
      content = (
        <div className={className.join(' ')}>
          <div className="ask-quit__question">
            {text.areYouSureYouWantToQuit}
          </div>
          <div className="ask-quit__item">
            <button className="btn btn-default" onClick={props.onCancel}>{text.cancel}</button>
            <button className="btn btn-primary" onClick={props.onQuit}>{text.quit}</button>
          </div>
          <div className="ask-quit__small-item">
            <label>
              <input checked={props.askQuit} onChange={props.onAskQuitChange} type="checkbox"/>
              {text.alwaysAskBeforeQuiting}
            </label>
          </div>
        </div>
      );
    }

    return content;
  }
});
