import React from 'react';
import Marked from '../marked/marked.jsx';
import PreferencesText from './items/preferences-text.jsx';
import PreferencesNumber from './items/preferences-number.jsx';
import PreferencesCheckbox from './items/preferences-checkbox.jsx';
import PreferencesSelect from './items/preferences-select.jsx';
import PreferencesPythonCmd from './items/preferences-python-cmd.jsx';
import './preferences-item.css';

/**
 * @class DocCode
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesItem',
  propTypes: {
    item: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  },
  render: function () {
    const props = this.props,
      className = 'preferences-item',
      types = {
        select: () => <PreferencesSelect {...props} className={className}/>,
        text: () => <PreferencesText {...props} className={className}/>,
        number: () => <PreferencesNumber {...props} className={className}/>,
        checkbox: () => <PreferencesCheckbox {...props} className={className}/>,
        pythonCmd: () => <PreferencesPythonCmd {...props} className={className}/>,
        marked: () => <div className={className}><Marked>{props.item.explanation}</Marked></div>
      };

    return types[props.item.type] ? types[props.item.type]() : null;
  }
});
