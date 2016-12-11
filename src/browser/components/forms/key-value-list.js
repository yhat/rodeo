import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './key-value-list.css';
import Closeable from '../tabs/closeable';

export default React.createClass({
  displayName: 'KeyValueList',
  propTypes: {
    container: React.PropTypes.object,
    onAddFromListContainer: React.PropTypes.func,
    onAddListContainer: React.PropTypes.func,
    onCancelListContainer: React.PropTypes.func,
    onChange: React.PropTypes.func.isRequired,
    onContainerValueChange: React.PropTypes.func,
    onRemoveFromList: React.PropTypes.func,
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
    let value = props.value,
      container;

    if (!_.isObject(value)) {
      value = props.originalValue;
    }

    if (props.container) {
      container = (
        <div className="key-value-list__container">
          <div className="key-value-list__new_entry_data">
            <label className="key-value-list__new_entry_data_key">
              {text.keyTableHeader}
              <input
                onChange={_.partial(props.onContainerValueChange, 'name')}
                value={props.container.name}
              />
            </label>

            <label className="key-value-list__new_entry_data_value">
              {text.valueTableHeader}
              <input
                onChange={_.partial(props.onContainerValueChange, 'value')}
                value={props.container.value}
              />
            </label>
          </div>
          <div className="key-value-list__new_entry_actions">
            <button className="btn btn-default" onClick={props.onCancelListContainer}>
              {text.cancel}
            </button>
            <button className="btn btn-default" onClick={_.partial(props.onAddFromListContainer, props.container)}>
              {text.add}
            </button>
          </div>
        </div>
      );
    } else {
      container = (
        <div className="key-value-list__actions">
          <a onClick={props.onChange}>
            <span className="fa fa-refresh"/>
            {text.reload}
          </a>
          <a onClick={_.partial(props.onAddListContainer, {key: props.id, name: '', value: ''})}>
            <span className="fa fa-plus"/>
            {text.addEnvironmentVariable}
          </a>
        </div>
      );
    }

    return (
      <div className={className.join(' ')}>
        <label htmlFor={props.id}>{text[props.label]}</label>
        {container}
        <table>
          <tr>
            <th>{text.keyTableHeader}</th>
            <th>{text.valueTableHeader}</th>
          </tr>
          {_.map(value, (value, key) => {
            value = value || ' ';
            return (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  <div className="key-value-list__row">
                    {value}
                    <div className="key-value-list__row_menu">
                      <Closeable onClick={_.partial(props.onRemoveFromList, key)}/>
                    </div>
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
