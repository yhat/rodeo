import _ from 'lodash';
import React from 'react';
import PreferencesTab from './preferences-tab.jsx';
import PreferencesItem from './preferences-item.jsx';
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
    changes: React.PropTypes.object,
    className: React.PropTypes.string,
    id: React.PropTypes.string,
    isSaveEnabled: React.PropTypes.bool,
    onApply: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onOK: React.PropTypes.func,
    onTabClick: React.PropTypes.func,
    preferencesMap: React.PropTypes.array
  },
  getDefaultProps: function () {
    return {
      isSaveEnabled: false,
      onApply: _.noop,
      onCancel: _.noop,
      onChange: _.noop,
      onOK: _.noop,
      onTabClick: _.noop
    };
  },
  render: function () {
    const props = this.props,
      isSaveEnabled = _.size(props.changes) > 0,
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
                  className={changeToken ? changeToken.state : ''}
                  key={item.key}
                  onChange={_.partial(props.onChange, item)}
                  {...item}
                />
              );
            })}
          </div>
          <footer>
            <button className="btn btn-default" onClick={props.onCancel}>{'Cancel'}</button>
            <button className="btn btn-default" disabled={!isSaveEnabled} onClick={props.onApply}>{'Apply'}</button>
            <button className="btn btn-default" disabled={!isSaveEnabled} onClick={props.onOK}>{'OK'}</button>
          </footer>
        </section>
      </div>
    );
  }
});
