import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import PreferencesButton from './items/preferences-button';
import SaveChangesButtonGroup from './save-changes-button-group.jsx';
import PreferencesCheckbox from './items/preferences-checkbox';
import PreferencesEnvVarList from './items/preferences-env-var-list';
import PreferencesFolder from './items/preferences-folder';
import PreferencesNumber from './items/preferences-number';
import PreferencesPythonCmd from './items/preferences-python-cmd';
import PreferencesSelect from './items/preferences-select';
import PreferencesTab from './preferences-tab.jsx';
import PreferencesText from './items/preferences-text';
import commonReact from '../../services/common-react';
import './preferences-list.css';

function getInnerClassName(item, change) {
  const className = ['preferences-item'];

  if (change) {
    className.push('preferences-item--' + change.state);
  }

  return className.join(' ');
}

export default React.createClass({
  displayName: 'PreferencesList',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    canSave: React.PropTypes.bool.isRequired,
    changes: React.PropTypes.object.isRequired,
    onAddFromListContainer: React.PropTypes.func.isRequired,
    onAddListContainer: React.PropTypes.func.isRequired,
    onApply: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onCancelListContainer: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onContainerValueChange: React.PropTypes.func.isRequired,
    onManageConnections: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired,
    onRemoveFromList: React.PropTypes.func.isRequired,
    onSelectFile: React.PropTypes.func.isRequired,
    onSelectFolder: React.PropTypes.func.isRequired,
    onTabClick: React.PropTypes.func.isRequired,
    preferenceMap: React.PropTypes.array.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      activePreferenceGroup = _.find(props.preferenceMap, {id: props.active}),
      className = commonReact.getClassNameList(this),
      text = this.context.text,
      types = {
        button: item => (
          <PreferencesButton
            {...item}
            className={getInnerClassName(item, props.changes[item.key])}
            key={item.id}
          />
        ),
        checkbox: item => (
          <PreferencesCheckbox
            {...item}
            {...props.changes[item.key]}
            className={getInnerClassName(item, props.changes[item.key])}
            key={item.id}
            onChange={_.partial(props.onChange, item)}
            originalValue={item.value}
          />
        ),
        environmentVariableList: item => (
          <PreferencesEnvVarList
            {...item}
            {...props.changes[item.key]}
            className={getInnerClassName(item, props.changes[item.key])}
            key={item.id}
            onAddFromListContainer={_.partial(props.onAddFromListContainer, item)}
            onAddListContainer={_.partial(props.onAddListContainer, item)}
            onCancelListContainer={_.partial(props.onCancelListContainer, item)}
            onChange={_.partial(props.onChange, item)}
            onContainerValueChange={_.partial(props.onContainerValueChange, item)}
            onRemoveFromList={_.partial(props.onRemoveFromList, item)}
            originalValue={item.value}
          />
        ),
        folder: item => (
          <PreferencesFolder
            {...item}
            {...props.changes[item.key]}
            className={getInnerClassName(item, props.changes[item.key])}
            key={item.id}
            onChange={_.partial(props.onChange, item)}
            onSelectFolder={_.partial(props.onSelectFolder, item)}
            originalValue={item.value}
          />
        ),
        number: item => (
          <PreferencesNumber
            {...item}
            {...props.changes[item.key]}
            className={getInnerClassName(item, props.changes[item.key])}
            key={item.id}
            onChange={_.partial(props.onChange, item)}
            originalValue={item.value}
          />
        ),
        marked: item => (
          <div className={getInnerClassName(item)} key={item.id}>
            <Marked>{text[item.explanation]}</Marked>
          </div>
        ),
        pythonCmd: item => (
          <PreferencesPythonCmd
            {...item}
            {...props.changes[item.key]}
            className={getInnerClassName(item, props.changes[item.key])}
            key={item.id}
            onChange={_.partial(props.onChange, item)}
            onSelectFile={_.partial(props.onSelectFile, item)}
            originalValue={item.value}
          />
        ),
        select: item => (
          <PreferencesSelect
            {...item}
            {...props.changes[item.key]}
            className={getInnerClassName(item, props.changes[item.key])}
            key={item.id}
            onChange={_.partial(props.onChange, item)}
            originalValue={item.value}
          />
        ),
        text: item => (
          <PreferencesText
            {...item}
            {...props.changes[item.key]}
            className={getInnerClassName(item, props.changes[item.key])}
            key={item.id}
            onChange={_.partial(props.onChange, item)}
            originalValue={item.value}
          />
        )
      };

    return (
      <section className={className.join(' ')}>
        <div className="preferences-list-content">
          <div className="preference-group-list">
            {_.map(props.preferenceMap, item => {
              const id = item.id,
                active = id === props.active,
                disabled = !active && _.size(props.changes) > 0;

              return (
                <PreferencesTab
                  active={active}
                  disabled={disabled}
                  id={id}
                  key={id}
                  onClick={_.partial(props.onTabClick, id)}
                >{text[item.label]}</PreferencesTab>
              );
            })}
          </div>
          <div className="preference-group-details">
            {_.map(activePreferenceGroup.items, item => types[item.type] ? types[item.type](item) : null)}
          </div>
        </div>
        <footer>
          <SaveChangesButtonGroup
            canSave={props.canSave}
            hasChanges={_.size(props.changes) > 0}
            onCancel={props.onCancel}
            onOK={props.onOK}
            onSave={props.onApply}
          />
        </footer>
      </section>
    );
  }
});
