import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './input-list.css';
import Closeable from '../tabs/closeable';

export default React.createClass({
  displayName: 'InputList',
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
    let list = props.value,
      editContainer;

    if (!_.isObject(list)) {
      list = props.originalValue;
    }

    if (props.editContainer) {
      editContainer = (
        <div className="input-list__container">
          <div className="input-list__new_entry_data">
            <label className="input-list__new_entry_data_value">
              {text.valueTableHeader}
              <input
                onChange={_.partial(props.onEditValueChange, 'value')}
                value={props.editContainer.value}
              />
            </label>
          </div>
          <div className="input-list__new_entry_actions">
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
        <div className="input-list__actions">
          <a onClick={_.partial(props.onEditStart, {name: '', value: ''})}>
            <span className="fa fa-plus"/>
            {text.add}
          </a>
        </div>
      );
    }

    function getClose(item, index) {
      if (item.editable !== false) {
        return (
          <div className="input-list__row_menu">
            <Closeable onClick={_.partial(props.onRemoveKey, index)}/>
          </div>
        );
      }
    }

    function getRows(items) {
      if (items && items.length) {
        return _.map(items, (item, index) => {
          item = item || {value: ' '};
          const itemClassName = ['input-list__item'];

          if (item.source) {
            itemClassName.push('input-list__item--' + item.source);
          }

          return (
            <tr className={itemClassName.join(' ')} key={item.key}>
              <td>
                <div className="input-list__row">
                  {item.value}
                  {getClose(item, index)}
                </div>
              </td>
            </tr>
          );
        });
      } else {
        return (
          <tr key="empty">
            <td>
              <div className="input-list__row">{text.none}</div>
            </td>
          </tr>
        );
      }
    }

    return (
      <div className={className.join(' ')}>
        <label htmlFor={props.id}>{text[props.label]}</label>
        {editContainer}
        <table>

          <tr>
            <th>{props.listColumnLabel && text[props.listColumnLabel] || text.valueTableHeader}</th>
          </tr>

          {getRows(list)}

        </table>
      </div>
    );
  }
});
