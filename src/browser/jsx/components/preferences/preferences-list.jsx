import _ from 'lodash';
import React from 'react';
import PreferencesTab from './preferences-tab.jsx';
import PreferencesItem from './preferences-item.jsx';
import SaveChangesButtonGroup from './save-changes-button-group.jsx';
import './preferences-list.css';

/**
 * @class PreferencesList
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'PreferencesList',
  propTypes: {
    active: React.PropTypes.string,
    canSave: React.PropTypes.bool,
    changes: React.PropTypes.object,
    className: React.PropTypes.string,
    id: React.PropTypes.string,
    onApply: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onOK: React.PropTypes.func,
    onTabClick: React.PropTypes.func,
    preferencesMap: React.PropTypes.array
  },
  getDefaultProps: function () {
    return {
      canSave: false,
      onApply: _.noop,
      onCancel: _.noop,
      onChange: _.noop,
      onOK: _.noop,
      onTabClick: _.noop
    };
  },
  render: function () {
    const props = this.props,
      activePreferenceGroup = _.find(props.preferencesMap, {id: props.active});

    return (
      <div className="preferences-list">
        <div className="preference-group-list">
          {_.map(props.preferencesMap, item => {
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
        <section className="preference-group-details container">
          <div className="form-inline">
            {_.map(activePreferenceGroup.items, item => {
              const changeToken = props.changes[item.key];

              return (
                <PreferencesItem

                  className={changeToken ? changeToken.state : null}
                  key={item.key}
                  onChange={_.partial(props.onChange, item)}
                  value={changeToken ? changeToken.value : item.defaultValue}
                  {...item}
                />
              );
            })}
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
      </div>
    );
  }
});
