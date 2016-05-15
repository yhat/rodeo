import _ from 'lodash';
import bluebird from 'bluebird';
import React from 'react';
import Marked from '../marked/marked.jsx';
import * as store from '../../services/store';
import './preferences.css';
import cid from '../../services/cid';
import globalSettingsText from './global-settings.md';
import pythonSettingsText from './python-settings.md';
import aceEditorText from './ace-editor.md';
import consoleText from './console.md';
import checkBackLaterPlotSettings from './check-back-later-plot-settings.md';
import checkBackLaterGit from './check-back-later-git.md';
import checkBackLaterProjectSettings from './check-back-later-project-level-settings.md';
import preferencesMapDefinition from './preferences.yml';
import * as validation from '../../services/validation';
import {send} from '../../services/ipc';

const preferenceGroupListClass = 'preference-group-list',
  preferenceGroupDetailsClass = 'preference-group-details',
  preferenceDetailsItem = 'preference-group-details-item',
  tabClass = 'preferences-tab',
  activeTabClass = 'preferences-tab-active';

function insertUniqueIds(preferencesMap) {
  return _.map(preferencesMap, function (preferenceGroup) {
    preferenceGroup.id = cid();
    return preferenceGroup;
  });
}

let validators = {
  isPathReal: value => send('expand_file_path', value)
    .then(expandedFilename => send('file_stats', expandedFilename)),
  isPython: value => send('check_kernel', {cmd: value}),
  isFontSize: validation.isFontSize,
  isTabSpace: validation.isTabSpace
};

/**
 * @param {object} item
 * @param {Array} item.valid  List of validators by key
 * @param {string} value
 * @returns {Promise<boolean>}
 */
function isValid(item, value) {
  if (!item.valid) {
    return bluebird.resolve(true);
  }

  return bluebird.all(_.map(item.valid, function (key) {
    let validator = validators[key];

    if (validator) {
      return validators[key](value);
    }

    console.warn('Validator', key, 'does not exist');
  })).timeout(2000);
}

/**
 * @class Preferences
 * @extends ReactComponent
 * @property props
 * @property state
 */
export default React.createClass({
  displayName: 'Preferences',
  propTypes: {
    onClose: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      onClose: _.noop
    };
  },
  getInitialState: function () {
    return {
      active: '',
      changes: {},
      preferencesMap: insertUniqueIds(preferencesMapDefinition)
    };
  },
  handleTabClick: function (active) {
    const state = this.state;

    if (_.size(state.changes) === 0) {
      this.setState({active});
    }
  },
  /**
   * Remember change.
   * @param {object} item
   * @param {string} item.key
   * @param {Event} event
   */
  handleChange: function (item, event) {
    let changes = this.state.changes,
      newValue = event.target.value,
      key = item.key;

    if (store.get(key) === newValue && changes[key]) {
      // if they set it back to the current settings, remove it from the map of changes.
      this.setKeyUnchanged(key);
    } else if (changes[key] !== newValue) {
      // if it's a new value than what we currently have, or if it wasn't changed yet, save it as a change.
      isValid(item, newValue)
        // if it's a new value than what we currently have, or if it wasn't changed yet, save it as a change.
        .then((valid) => {
          if (_.every(valid, result => !!result)) {
            return this.setKeyChanged(key, newValue);
          }
          this.setKeyInvalid(key, newValue);
        })
        // if anything bad happens, it's invalid
        .catch(_.partial(this.setKeyInvalid, key, newValue));
    }
  },
  setKeyUnchanged: function (key) {
    let changes = this.state.changes;

    changes = _.clone(changes);
    delete changes[key];
    this.setState({changes});
  },
  setKeyChanged: function (key, newValue) {
    let changes = this.state.changes;

    changes = _.clone(changes);
    changes[key] = {value: newValue, state: 'changed'};
    this.setState({changes});
  },
  setKeyInvalid: function (key, newValue, error) {
    let changes = this.state.changes;

    console.warn('Invalid key', key, 'of', newValue, error);

    changes = _.clone(changes);
    changes[key] = {value: newValue, state: 'invalid'};
    this.setState({changes});
  },
  /**
   * Discard changes, close.
   */
  handleCancel: function () {
    const props = this.props;

    this.setState({changes: {}});
    props.onClose();
  },
  /**
   * Save the changed keys, do not close.
   */
  handleSave: function () {
    const state = this.state,
      changes = state.changes;

    // no invalid entries
    if (_.every(changes, {state: 'changed'})) {
      _.each(changes, (item, key) => store.set(key, item.value));

      this.setState({changes: {}});
    }
  },
  /**
   * Save the changed keys, close.
   */
  handleOK: function () {
    const state = this.state,
      props = this.props;

    if (_.size(state.changes) === 0) {
      // they made no changes, close
      props.onClose();
    } else {
      // same as saving and then closing
      this.handleSave();
      props.onClose();
    }
  },
  render: function () {
    const isSaveEnabled = _.size(this.state.changes) > 0,
      state = this.state,
      preferencesMap = state.preferencesMap,
      handleTabClick = this.handleTabClick,
      explanations = {
        globalSettingsText,
        pythonSettingsText,
        aceEditorText,
        consoleText,
        checkBackLaterPlotSettings,
        checkBackLaterGit,
        checkBackLaterProjectSettings
      },
      detailsClass = [
        preferenceGroupDetailsClass,
        'container' // twitter bootstrap class
      ].join(' ');
    let tabList, activePreferenceGroup, detailPane,
      active = state.active;

    if (!preferencesMap || _.size(preferencesMap) === 0) {
      throw new Error('Missing preferences map');
    }

    activePreferenceGroup = _.find(preferencesMap, {id: active});
    if (!activePreferenceGroup) {
      activePreferenceGroup = _.head(preferencesMap);
      active = activePreferenceGroup.id;
    }

    tabList = _.map(preferencesMap, item => {
      const isActive = item.id === active,
        className = [
          tabClass,
          isActive ? activeTabClass : '',
          !isActive && _.size(state.changes) > 0 ? 'disabled' : ''
        ].join(' ');

      return (
        <div
          className={className}
          id={item.id}
          key={item.id}
          onClick={_.partial(handleTabClick, item.id)}
        >{item.label}</div>
      );
    });

    activePreferenceGroup = _.find(preferencesMap, {id: active});
    if (activePreferenceGroup) {
      detailPane = _.map(activePreferenceGroup.items, (item, formGroupIndex) => {
        let contentList = [],
          contentClass = [
            preferenceDetailsItem,
            state.changes[item.key] ? state.changes[item.key].state : '' // the state is the class
          ],
          hasFormElements = false,
          formGroupId = 'preferences-form-group-' + formGroupIndex;

        if (item.explanation) {
          contentList.push(<Marked>{explanations[item.explanation]}</Marked>);
        }

        if (item.notImplementedYet) {
          contentList.push(<Marked class="not-implemented-yet">{explanations[item.notImplementedYet]}</Marked>);
        }

        if (item.label) {
          contentList.push(<label className="control-label" htmlFor={formGroupId}>{_.startCase(item.label)}</label>);
        }

        if (item.text) {
          hasFormElements = true;
          contentList.push((
            <input
              className="form-control"
              defaultValue={store.get(item.key)}
              id={formGroupId}
              key={item.key}
              onChange={_.partial(this.handleChange, item)}
              placeholder={item.placeholder}
              type="text"
            />
          ));
        } else if (item.checkbox) {
          hasFormElements = true;
          contentList.push((
            <input
              defaultValue={store.get(item.key)}
              id={formGroupId}
              key={item.key}
              onChange={_.partial(this.handleChange, item)}
              type="checkbox"
            />
          ));
        }

        if (hasFormElements) {
          contentClass.push('form-group');
        }

        contentClass = contentClass.join(' ');

        return <div className={contentClass}>{contentList}</div>;
      });
    }

    return (
      <div className="preferences">
        <div className={preferenceGroupListClass}>{tabList}</div>
        <section className={detailsClass}>
          <div className="form-inline">{detailPane}</div>
          <footer>
            <button className="btn btn-default" onClick={this.handleCancel}>{'Cancel'}</button>
            <button className="btn btn-default" disabled={!isSaveEnabled} onClick={this.handleSave}>{'Apply'}</button>
            <button className="btn btn-default" disabled={!isSaveEnabled} onClick={this.handleOK}>{'OK'}</button>
          </footer>
        </section>
      </div>
    );
  }
});
