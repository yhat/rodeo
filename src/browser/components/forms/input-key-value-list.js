import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './input-key-value-list.css';
import Closeable from '../tabs/closeable';

export default React.createClass({
  displayName: 'InputKeyValueList',
  propTypes: {
    editContainer: React.PropTypes.object,
    onEditCancel: React.PropTypes.func.isRequired,
    onEditSave: React.PropTypes.func.isRequired,
    onEditStart: React.PropTypes.func.isRequired,
    onEditValueChange: React.PropTypes.func.isRequired,
    onRemoveKey: React.PropTypes.func.isRequired,
    originalValue: React.PropTypes.object,
    value: React.PropTypes.object
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
    let keyValueList = props.value,
      editContainer;

    if (!_.isObject(keyValueList)) {
      keyValueList = props.originalValue;
    }

    if (props.editContainer) {
      editContainer = (
        <div className="input-key-value-list__container">
          <div className="input-key-value-list__new_entry_data">
            <label className="input-key-value-list__new_entry_data_key">
              {text.keyTableHeader}
              <input
                onChange={_.partial(props.onEditValueChange, 'name')}
                value={props.editContainer.name}
              />
            </label>

            <label className="input-key-value-list__new_entry_data_value">
              {text.valueTableHeader}
              <input
                onChange={_.partial(props.onEditValueChange, 'value')}
                value={props.editContainer.value}
              />
            </label>
          </div>
          <div className="input-key-value-list__new_entry_actions">
            <button className="btn btn-default" onClick={props.onEditCancel}>
              {text.cancel}
            </button>
            <button className="btn btn-default" onClick={props.onEditSave}>
              {text.add}
            </button>
          </div>
        </div>
      );
    } else {
      editContainer = (
        <div className="input-key-value-list__actions">
          <a onClick={_.partial(props.onEditStart, {name: '', value: ''})}>
            <span className="fa fa-plus"/>
            {text.add}
          </a>
        </div>
      );
    }

    function getClose(item) {
      if (item.editable !== false) {
        return (
          <div className="input-key-value-list__row_menu">
            <Closeable onClick={_.partial(props.onRemoveKey, item.key)}/>
          </div>
        );
      }
    }

    return (
      <div className={className.join(' ')}>
        <label htmlFor={props.id}>{text[props.label]}</label>
        {editContainer}
        <table>
          <tr>
            <th>{text.keyTableHeader}</th>
            <th>{text.valueTableHeader}</th>
          </tr>
          {_.map(keyValueList, item => {
            const itemClassName = ['input-key-value-list__item'];

            if (item.source) {
              itemClassName.push('input-key-value-list__item--' + item.source);
            }

            return (
              <tr className={itemClassName.join(' ')} key={item.key}>
                <td>{item.key}</td>
                <td>
                  <div className="input-key-value-list__row">
                    {item.value}
                    {getClose(item)}
                  </div>
                </td>
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
});
