import React from 'react';
import commonReact from '../../../services/common-react';

export default React.createClass({
  displayName: 'AskQuit',
  propTypes: {
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

    return (
      <div className={className.join(' ')}>
        {text.areYouSureYouWantToQuit}
        <div>
          <button className="btn btn-default" onClick={props.onQuit}>{text.quit}</button>
          <button className="btn btn-default" onClick={props.onCancel}>{text.cancel}</button>
        </div>
      </div>
    );
  }
});
