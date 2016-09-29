import React from 'react';
import Marked from '../marked/marked.jsx';
import PreferencesText from './items/preferences-text';
import PreferencesNumber from './items/preferences-number';
import PreferencesCheckbox from './items/preferences-checkbox';
import PreferencesSelect from './items/preferences-select';
import PreferencesPythonCmd from './items/preferences-python-cmd';
import PreferencesFolder from './items/preferences-folder';
import PreferencesButton from './items/preferences-button';
import './preferences-item.css';
import commonReact from '../../services/common-react';

/**
 * @class DocCode
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesItem',
  propTypes: {
    item: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onSelectFile: React.PropTypes.func.isRequired,
    onSelectFolder: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this).join(' '),
      types = {
        select: () => <PreferencesSelect {...props} className={className}/>,
        text: () => <PreferencesText {...props} className={className}/>,
        number: () => <PreferencesNumber {...props} className={className}/>,
        checkbox: () => <PreferencesCheckbox {...props} className={className}/>,
        pythonCmd: () => <PreferencesPythonCmd {...props} className={className}/>,
        folder: () => <PreferencesFolder {...props} className={className}/>,
        marked: () => <div className={className}><Marked>{props.item.explanation}</Marked></div>,
        button: () => <PreferencesButton {...props} className={className}/>
      };

    return types[props.item.type] ? types[props.item.type]() : null;
  }
});
