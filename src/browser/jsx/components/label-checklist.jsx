import _ from 'lodash';
import React from 'react';
import LabelCheckbox from './label-checkbox.jsx';

function isComponentOfType(component, type) {
  // react-hot-module mocks the type, but the displayNames are still okay
  return component.type.displayName === type.displayName;
}

/**
 * @class LabelCheckbox
 * @extends ReactComponent
 * @property props
 * @property state
 */
export default React.createClass({
  displayName: 'LabelCheckbox',
  propTypes: {
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    required: React.PropTypes.bool,
    type: React.PropTypes.oneOf(['checkbox', 'radio'])
  },
  getDefaultProps: function () {
    return {
      disabled: false,
      required: false,
      type: 'checkbox'
    };
  },
  render: function () {
    const props = this.props,
      className = ['label-checklist']; // bootstrap class
    let label;

    if (props.className) {
      className.push(props.className);
    }

    // For the disabled cursor to show on the label, bootstrap requires the disabled class on the parent element
    if (props.disabled) {
      className.push('disabled');
    }

    if (props.label) {
      label = <header>{props.label}</header>;
    }

    return (
      <section className={className.join(' ')}>
        {label}
        {React.Children.map(props.children, child => {
          if (isComponentOfType(child, LabelCheckbox)) {
            const propagatedProps = _.pick(props, ['disabled', 'name', 'required', 'type']),
              newProps = _.assign(child.props, propagatedProps);

            return React.cloneElement(child, newProps);
          } else {
            return child;
          }
        })}
      </section>
    );
  }
});
