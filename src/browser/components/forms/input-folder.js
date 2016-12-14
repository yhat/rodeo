import React from 'react';
import FormItemErrors from './form-item-errors.js';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'InputFolder',
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    onSelectFolder: React.PropTypes.func.isRequired,
    originalValue: React.PropTypes.string,
    value: React.PropTypes.string
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
    let errors;

    if (props.originalValue !== props.value) {
      className.push('folder-input--modified');
    }

    if (props.errors && props.errors.length) {
      errors = <FormItemErrors errors={props.errors} />;
    }

    return (
      <div className={className.join(' ')}>
        <label htmlFor={props.id}>{text[props.label]}</label>
        <div className="input-group">
          <input className="form-control" onChange={props.onChange}  type="text" value={props.value}/>
          <span className="input-group-container">
            <button className="btn btn-default" onClick={props.onSelectFolder}>{text.elipsis}</button>
          </span>
        </div>
        {errors}
      </div>
    );
  }
});
