import _ from 'lodash';
import React from 'react';
import PreferencesTab from './preferences-tab.jsx';
import PreferencesItem from './preferences-item.jsx';
import SaveChangesButtonGroup from './save-changes-button-group.jsx';
import './preferences-list.css';
import commonReact from '../../services/common-react';

/**
 * @class PreferencesList
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesList',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    canSave: React.PropTypes.bool.isRequired,
    changes: React.PropTypes.object.isRequired,
    onApply: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired,
    onSelectFile: React.PropTypes.func.isRequired,
    onSelectFolder: React.PropTypes.func.isRequired,
    onTabClick: React.PropTypes.func.isRequired,
    preferenceMap: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      activePreferenceGroup = _.find(props.preferenceMap, {id: props.active});

    return (
      <div className="preferences-list">
        <div className="preference-group-list">
          {_.map(props.preferenceMap, item => {
            const isActive = item.id === props.active,
              isDisabled = !isActive && _.size(props.changes) > 0,
              id = item.id;

            return (
              <PreferencesTab
                active={isActive}
                disabled={isDisabled}
                id={id}
                key={id}
                onClick={_.partial(props.onTabClick, id)}
              >{item.label}</PreferencesTab>
            );
          })}
        </div>
        <section className="preference-group-details">
          {_.map(activePreferenceGroup.items, (item, itemIndex) => (
            <PreferencesItem
              item={_.assign({}, item, props.changes[item.key])}
              key={item.key || itemIndex}
              onChange={_.partial(props.onChange, item)}
              onSelectFile={_.partial(props.onSelectFile, item)}
              onSelectFolder={_.partial(props.onSelectFolder, item)}
            />
          ))}
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
      </div>
    );
  }
});
