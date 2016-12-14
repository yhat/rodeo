import _ from 'lodash';
import React from 'react';
import Marked from '../marked';
import ButtonReferenced from './button-referenced';
import InputCheckbox from './input-checkbox';
import InputList from './input-list';
import InputKeyValueList from './input-key-value-list';
import InputFolder from './input-folder';
import InputNumber from './input-number';
import InputPythonCmd from './input-python-cmd';
import InputText from './input-text';
import InputSelect from './input-select';
import commonReact from '../../services/common-react';
import './form-list.css';

function getInnerClassName(item, change) {
  const className = ['form-item'];

  if (change) {
    className.push('form-item--' + change.state);
  }

  return className.join(' ');
}

export default React.createClass({
  displayName: 'FormList',
  propTypes: {
    changes: React.PropTypes.object.isRequired,
    items: React.PropTypes.object.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      text = this.context.text,
      fns = _.pickBy(props, _.isFunction),
      types = {
        button: item => (
          <ButtonReferenced
            {...item}
            key={item.id}
          />
        ),
        checkbox: item => (
          <InputCheckbox
            {...item}
            {...props.changes[item.key]}
            key={item.id}
            originalValue={item.value}
          />
        ),
        list: item => (
          <InputList
            {...item}
            {...props.changes[item.key]}
            key={item.id}
            originalValue={item.value}
          />
        ),
        keyValueList: item => (
          <InputKeyValueList
            {...item}
            {...props.changes[item.key]}
            key={item.id}
            originalValue={item.value}
          />
        ),
        folder: item => (
          <InputFolder
            {...item}
            {...props.changes[item.key]}
            key={item.id}
            originalValue={item.value}
          />
        ),
        number: item => (
          <InputNumber
            {...item}
            {...props.changes[item.key]}
            key={item.id}
            originalValue={item.value}
          />
        ),
        marked: item => (
          <div className={getInnerClassName(item)} key={item.id}>
            <Marked>{text[item.explanation]}</Marked>
          </div>
        ),
        pythonCmd: item => (
          <InputPythonCmd
            {...item}
            {...props.changes[item.key]}
            key={item.id}
            originalValue={item.value}
          />
        ),
        select: item => (
          <InputSelect
            {...item}
            {...props.changes[item.key]}
            key={item.id}
            originalValue={item.value}
          />
        ),
        text: item => (
          <InputText
            {...item}
            {...props.changes[item.key]}
            key={item.id}
            originalValue={item.value}
          />
        )
      };

    return (
      <div className={className.join(' ')}>
        {_.map(props.items, item => types[item.type] ? types[item.type](_.assign(
          {className: getInnerClassName(item, props.changes[item.key])},
            item,
            _.mapValues(fns, fn => _.partial(fn, item))
          )) : null)}
      </div>
    );
  }
});
