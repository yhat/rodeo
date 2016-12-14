import React from 'react';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'InputNumber',
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    originalValue: React.PropTypes.number,
    value: React.PropTypes.number
  },
  contextTypes: {
    text: React.PropTypes.object
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this);

    if (props.originalValue !== props.value) {
      className.push('number-input--modified');
    }

    return (
      <div className={className.join(' ')}>
        <label htmlFor={props.id}>{text[props.label]}</label>
        <input className="form-input" onChange={props.onChange} type="number" value={props.value}/>
      </div>
    );
  }
});
