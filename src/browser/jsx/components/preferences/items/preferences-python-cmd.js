import _ from 'lodash';
import React from 'react';
import PreferencesItemErrors from '../preferences-item-errors.jsx';
import commonReact from '../../../services/common-react';

/**
 * @class PreferencesPythonCmd
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesPythonCmd',
  propTypes: {
    className: React.PropTypes.string,
    item: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onSelectFile: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      item = props.item;
    let label,
      content = [];

    if (item.label) {
      content.push(<label htmlFor={item.id}>{_.startCase(item.label)}</label>);
    }

    content.push(<div className="input-group">
      <input className="form-control" key="input" onChange={props.onChange} {...item} type="text"/>
      <span className="input-group-container">
        <button className="btn btn-default" onClick={props.onSelectFile}>{'…'}</button>
      </span>
    </div>);

    if (item.errors) {
      const errors = item.errors;

      if (errors && errors.length) {
        content.push(<PreferencesItemErrors errors={errors} key="errors" />);
      }
    }

    return <div className={className.join(' ')}>{content}</div>;
  }
});
