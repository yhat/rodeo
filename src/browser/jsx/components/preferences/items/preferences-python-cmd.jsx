import _ from 'lodash';
import React from 'react';
import PreferencesItemErrors from '../preferences-item-errors.jsx';

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
    onChange: React.PropTypes.func.isRequired
  },
  render: function () {
    const displayName = this.constructor.displayName,
      props = this.props,
      className = [_.kebabCase(displayName)],
      item = props.item;
    let label,
      content = [];

    if (item.label) {
      content.push(<label htmlFor={item.id}>{_.startCase(item.label)}</label>);
    }

    if (props.className) {
      className.push(props.className);
    }

    content.push(<input key="input" onChange={props.onChange} {...item} type="text"/>);

    if (item.checkKernel) {
      const checkKernel = item.checkKernel;

      if (checkKernel.errors) {
        content.push(<PreferencesItemErrors errors={checkKernel.errors} key="errors" />);
      }
    }

    return <div className={className.join(' ')}>{content}</div>;
  }
});
