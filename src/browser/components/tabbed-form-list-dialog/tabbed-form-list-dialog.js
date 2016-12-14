import _ from 'lodash';
import React from 'react';
import FormList from '../forms/form-list';
import SaveChangesButtonGroup from '../forms/save-changes-button-group';
import TabbedFormListDialogTab from './tabbed-form-list-dialog-tab';
import commonReact from '../../services/common-react';
import './tabbed-form-list-dialog.css';

export default React.createClass({
  displayName: 'TabbedFormListDialog',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    canSave: React.PropTypes.bool.isRequired,
    changes: React.PropTypes.object.isRequired,
    onApply: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired,
    onTabClick: React.PropTypes.func.isRequired,
    preferenceMap: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      activePreferenceGroup = _.find(props.preferenceMap, {id: props.active}),
      className = commonReact.getClassNameList(this),
      fns = _.pickBy(props, _.isFunction);

    return (
      <section className={className.join(' ')}>
        <div className="tabbed-form-list-dialog__content">
          <div className="tabbed-form-list-dialog__tabs">
            {_.map(props.preferenceMap, item => {
              const id = item.id,
                active = id === props.active,
                disabled = !active && _.size(props.changes) > 0;

              return (
                <TabbedFormListDialogTab
                  active={active}
                  disabled={disabled}
                  id={id}
                  key={id}
                  label={item.label}
                  onClick={_.partial(props.onTabClick, id)}
                />
              );
            })}
          </div>
          <FormList {...fns} changes={props.changes} items={activePreferenceGroup.items} />
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
