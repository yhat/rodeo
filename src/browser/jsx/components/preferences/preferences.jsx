import _ from 'lodash';
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

/**
 * @class Preferences
 * @extends ReactComponent
 * @property props
 * @property state
 */
export default React.createClass({
  displayName: 'Preferences',
  propTypes: {
    onApply: React.PropTypes.func,
    onOK: React.PropTypes.func
  },
  getInitialState: function () {
    return {
      active: '',
      preferencesMap: insertUniqueIds(preferencesMapDefinition)
    };
  },
  handleTabClick: function (active) {
    this.setState({active});
  },
  render: function () {
    const state = this.state,
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

    activePreferenceGroup = _.find(preferencesMap, {id: active});
    if (!activePreferenceGroup) {
      activePreferenceGroup = _.head(preferencesMap);
      active = activePreferenceGroup.id;
    }

    tabList = _.map(preferencesMap, item => {
      const isActive = item.id === active,
        className = [
          tabClass,
          isActive ? activeTabClass : ''
        ].join(' ');

      return <div className={className} id={item.id} key={item.id} onClick={_.partial(handleTabClick, item.id)}>{item.label}</div>;
    });

    activePreferenceGroup = _.find(preferencesMap, {id: active});
    if (activePreferenceGroup) {
      detailPane = _.map(activePreferenceGroup.items, (item, formGroupIndex) => {
        let contentList = [],
          contentClass = [preferenceDetailsItem],
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
          contentList.push(<input className="form-control" id={formGroupId} placeholder={item.placeholder} type="text" value={store.get(item.key)} />);
        } else if (item.checkbox) {
          hasFormElements = true;
          contentList.push(<input id={formGroupId} type="checkbox" value={store.get(item.key)} />);
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
        <div className={detailsClass}><div className="form-inline">{detailPane}</div></div>
      </div>
    );
  }
});
